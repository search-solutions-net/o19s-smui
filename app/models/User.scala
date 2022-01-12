package models

import anorm.Column.columnToString
import anorm.SqlParser.get
import anorm._
import play.api.libs.json._
import services.HashService

import java.sql.Connection
import java.time.LocalDateTime

class UserId(id: String) extends Id(id)
object UserId extends IdObject[UserId](new UserId(_))

/**
  * Defines a user
  */
case class User(id: UserId = UserId(),
                    name: String,
                    email: String,
                    password: Option[String],
                    admin: Boolean = false,
                    passwordChangeRequired: Option[Boolean] = Option(false),
                    lastUpdate: Option[LocalDateTime] = Option(LocalDateTime.now())) {

  import User._

  def toNamedParameters(hashService: HashService): Seq[NamedParameter] = {
    Seq(
      ID -> id,
      NAME -> name,
      EMAIL -> email,
      PASSWORD -> getHashedPassword(hashService, password),
      HASH_ROUTINE_ID -> getHashRoutineId(hashService),
      ADMIN -> (if (admin) 1 else 0),
      PASSWORD_CHANGE_REQUIRED -> (if (passwordChangeRequired.getOrElse(false)) 1 else 0),
      LAST_UPDATE -> lastUpdate
    )
  }

  def displayValue: String = name + " (" + email + ")"

}

object User {
  val TABLE_NAME = "user"
  val TABLE_NAME_USER_2_TEAM = "user_2_team"

  val ID = "id"
  val NAME = "name"
  val EMAIL = "email"
  val PASSWORD = "password"
  val HASH_ROUTINE_ID = "hash_routine"
  val ADMIN = "admin"
  val PASSWORD_CHANGE_REQUIRED = "password_change_required"
  val LAST_UPDATE = "last_update"

  val USER_ID = "user_id"
  val TEAM_ID = "team_id"

  val ANONYMOUS_USER_ID = "anonymous"
  val PASSWORD_MASKED = "######"

  implicit val jsonReads: Reads[User] = Json.reads[User]

  private val defaultWrites: OWrites[User] = Json.writes[User]
  implicit val jsonWrites: OWrites[User] = OWrites[User] { user =>
    Json.obj("displayValue" -> user.displayValue) ++ defaultWrites.writes(user)
  }

  def getHashRoutineId(hashService: HashService): Int =
    if (hashService == null) 0 else hashService.passwordHashRoutineId

  def getHashedPassword(hashService: HashService, password: Option[String]): String =
    if (hashService == null) password.getOrElse("") else hashService.createPasswordHash(password.getOrElse(""))

  def anonymous(): User = User(UserId(ANONYMOUS_USER_ID), null, null, Option.empty, true, Option(false), Option(LocalDateTime.now()))

  def create(name: String,
             email: String,
             password: Option[String],
             admin: Boolean = false,
             passwordChangeRequired: Option[Boolean] = Option(false)): User = {
    User(UserId(), name, email, password, admin, passwordChangeRequired, Option(LocalDateTime.now()))
  }

  val sqlParser: RowParser[User] = get[UserId](s"$TABLE_NAME.$ID") ~
    get[String](s"$TABLE_NAME.$NAME") ~
    get[String](s"$TABLE_NAME.$EMAIL") ~
    get[Int](s"$TABLE_NAME.$ADMIN") ~
    get[Int](s"$TABLE_NAME.$PASSWORD_CHANGE_REQUIRED") ~
    get[LocalDateTime](s"$TABLE_NAME.$LAST_UPDATE") map { case id ~ username ~ email ~ admin ~ passwordChangeRequired ~ lastUpdate =>
    User(id, username, email, Option(PASSWORD_MASKED), admin > 0, Option(passwordChangeRequired > 0), Option(lastUpdate))
  }

  val sqlParserPasswordWithRoutine: RowParser[(String,Int)] = get[String](s"$TABLE_NAME.$PASSWORD") ~
    get[Int](s"$TABLE_NAME.$HASH_ROUTINE_ID") map { case password ~ routineId => (password, routineId)}

  def insert(hashService: HashService, newUsers: User*)(implicit connection: Connection): Option[Int] = {
    var result: Array[Int]  = Array[Int]();
    if (newUsers.nonEmpty) {
      result = BatchSql(s"insert into $TABLE_NAME ($ID, $NAME, $EMAIL, $PASSWORD, $HASH_ROUTINE_ID, $ADMIN, $PASSWORD_CHANGE_REQUIRED, $LAST_UPDATE) " +
        s"values ({$ID}, {$NAME}, {$EMAIL}, {$PASSWORD}, {$HASH_ROUTINE_ID}, {$ADMIN}, {$PASSWORD_CHANGE_REQUIRED}, {$LAST_UPDATE})",
        newUsers.head.toNamedParameters(hashService),
        newUsers.tail.map(_.toNamedParameters(hashService)): _*
      ).execute()
    }
    result.headOption
  }

  def getUser(userId: String)(implicit connection: Connection): Option[User] = {
    SQL"select * from #$TABLE_NAME where id = $userId"
      .as(sqlParser.*).headOption
  }

  def getUsers(ids: Seq[String])(implicit connection: Connection): List[User] = {
    val isLoadAll = (ids.isEmpty)
    val idsString = ids.mkString("'","','","'")
    SQL"select * from #$TABLE_NAME where #$isLoadAll or id in (#$idsString) order by #$EMAIL asc, #$NAME asc"
      .as(sqlParser.*)
  }

  def getUserCount()(implicit connection: Connection): Int = {
    SQL"select count(*) from #$TABLE_NAME"
      .as(SqlParser.int(1).single)
  }

  def update(hashService: HashService, id: UserId, username: String, email: String, password: Option[String], admin: Boolean, passwordChangeRequired: Option[Boolean])(implicit connection: Connection): Int = {
    val adminInt = if (admin) 1 else 0
    val passwordChangeRequiredInt = if (passwordChangeRequired.getOrElse(false)) 1 else 0
    val result =
      if (passwordChangeRequired.nonEmpty) {
        SQL"update #$TABLE_NAME set #$NAME = $username, #$EMAIL = $email, #$ADMIN = $adminInt, #$PASSWORD_CHANGE_REQUIRED = $passwordChangeRequiredInt, #$LAST_UPDATE = ${LocalDateTime.now()} where #$ID = $id".executeUpdate()
      } else {
        SQL"update #$TABLE_NAME set #$NAME = $username, #$EMAIL = $email, #$ADMIN = $adminInt, #$LAST_UPDATE = ${LocalDateTime.now()} where #$ID = $id".executeUpdate()
      }
    if (result > 0 && password.nonEmpty) {
      val newPassword = getHashedPassword(hashService, password)
      val hashRoutineId = getHashRoutineId(hashService)
      SQL"update #$TABLE_NAME set #$NAME = $username, #$PASSWORD = $newPassword, #$HASH_ROUTINE_ID = $hashRoutineId, #$LAST_UPDATE = ${LocalDateTime.now()} where #$ID = $id".executeUpdate()
    }
    result
  }

  def deleteByIds(ids: Seq[UserId])(implicit connection: Connection): Int = {
    var count = 0
    for (idGroup <- ids.grouped(100)) {
      count += SQL"delete from #$TABLE_NAME where #$ID in ($idGroup)".executeUpdate()
    }
    count
  }

  def getUserByEmail(email: String)(implicit connection: Connection): Option[User] = {
    SQL"select * from #$TABLE_NAME where #$EMAIL = $email order by #$NAME asc"
      .as(sqlParser.*).headOption
  }

  def isValidEmailPasswordCombo(hashService: HashService, email: String, password: String)(implicit connection: Connection): Boolean = {
    val p = SQL"select #$PASSWORD, #$HASH_ROUTINE_ID from #$TABLE_NAME where #$EMAIL = $email order by #$NAME asc"
      .as(sqlParserPasswordWithRoutine.*).headOption
    if (p.nonEmpty) {
      val (passwordHash, hashroutineId) = p.get
      hashService.validatePassword(hashroutineId, password, passwordHash)
    } else {
      false
    }
  }

  def getUser2Team(selectId: String, isLeftToRight: Boolean)(implicit connection: Connection): List[String] = {
    val selectFieldName = if (isLeftToRight) USER_ID else TEAM_ID
    val returnFieldName = if (isLeftToRight) TEAM_ID else USER_ID
    SQL"select #$returnFieldName from #$TABLE_NAME_USER_2_TEAM where #$selectFieldName=$selectId order by #$returnFieldName asc"
      .asTry(SqlParser.str(1).*).getOrElse(List.empty[String])
  }

  def addUser2Team(userId: String, teamId: String)(implicit connection: Connection): Int = {
    SQL"insert into #$TABLE_NAME_USER_2_TEAM (#$USER_ID, #$TEAM_ID, #$LAST_UPDATE) values ($userId, $teamId, ${LocalDateTime.now()})".executeUpdate()
  }

  def deleteUser2Team(userId: String, teamId: String)(implicit connection: Connection): Int = {
    SQL"delete from #$TABLE_NAME_USER_2_TEAM where #$USER_ID = $userId and #$TEAM_ID = $teamId".executeUpdate()
  }

}

