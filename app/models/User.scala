package models

import anorm.Column.columnToString
import anorm.SqlParser.get
import anorm._
import play.api.libs.json._

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
                    password: String,
                    admin: Boolean = false,
                    lastUpdate: LocalDateTime = LocalDateTime.now()) {

  import User._

  def toNamedParameters: Seq[NamedParameter] = Seq(
    ID -> id,
    NAME -> name,
    EMAIL -> email,
    PASSWORD -> password,
    ADMIN -> (if (admin) 1 else 0),
    LAST_UPDATE -> lastUpdate
  )

  def displayValue: String = name + " (" + email + ")"

}

object User {
  val TABLE_NAME = "user"
  val TABLE_NAME_USER_2_TEAM = "user_2_team"

  val ID = "id"
  val NAME = "name"
  val EMAIL = "email"
  val PASSWORD = "password"
  val ADMIN = "admin"
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

  def anonymous(): User = User(UserId(ANONYMOUS_USER_ID), null, null, null, true, LocalDateTime.now())

  def create(name: String,
             email: String,
             password: String,
             admin: Boolean = false): User = {
    User(UserId(), name, email, password, admin, LocalDateTime.now())
  }

  val sqlParser: RowParser[User] = get[UserId](s"$TABLE_NAME.$ID") ~
    get[String](s"$TABLE_NAME.$NAME") ~
    get[String](s"$TABLE_NAME.$EMAIL") ~
    get[String](s"$TABLE_NAME.$PASSWORD") ~
    get[Int](s"$TABLE_NAME.$ADMIN") ~
    get[LocalDateTime](s"$TABLE_NAME.$LAST_UPDATE") map { case id ~ username ~ email ~ password ~ admin ~ lastUpdate =>
    User(id, username, email, PASSWORD_MASKED, admin > 0, lastUpdate)
  }

  def insert(newUsers: User*)(implicit connection: Connection): Option[Int] = {
    var result: Array[Int]  = Array[Int]();
    if (newUsers.nonEmpty) {
      result = BatchSql(s"insert into $TABLE_NAME ($ID, $NAME, $EMAIL, $PASSWORD, $ADMIN, $LAST_UPDATE) " +
        s"values ({$ID}, {$NAME}, {$EMAIL}, {$PASSWORD}, {$ADMIN}, {$LAST_UPDATE})",
        newUsers.head.toNamedParameters,
        newUsers.tail.map(_.toNamedParameters): _*
      ).execute()
    }
    result.headOption
  }

  def getUser(userId: String)(implicit connection: Connection): Option[User] = {
    SQL"select * from #$TABLE_NAME where id = $userId"
      .as(sqlParser.*).headOption
  }

  def getUserCount()(implicit connection: Connection): Int = {
    SQL"select count(*) from #$TABLE_NAME"
      .as(SqlParser.int(1).single)
  }

  def update(id: UserId, username: String, email: String, password: String, admin: Boolean)(implicit connection: Connection): Int = {
    val adminInt = if (admin) 1 else 0
    SQL"update #$TABLE_NAME set #$NAME = $username, #$EMAIL = $email, #$PASSWORD = $password, #$ADMIN = $adminInt, #$LAST_UPDATE = ${LocalDateTime.now()} where #$ID = $id".executeUpdate()
  }

  def deleteByIds(ids: Seq[UserId])(implicit connection: Connection): Int = {
    var count = 0
    for (idGroup <- ids.grouped(100)) {
      count += SQL"delete from #$TABLE_NAME where #$ID in ($idGroup)".executeUpdate()
    }
    count
  }

  def loadAll()(implicit connection: Connection): Seq[User] = {
    SQL"select * from #$TABLE_NAME order by #$EMAIL asc, #$NAME asc"
      .as(sqlParser.*)
  }

  def getUserByEmail(email: String)(implicit connection: Connection): Option[User] = {
    SQL"select * from #$TABLE_NAME where #$EMAIL = $email order by #$NAME asc"
      .as(sqlParser.*).headOption
  }

  def isValidEmailPasswordCombo(email: String, password: String)(implicit connection: Connection): Boolean = {
    SQL"select count(*) from #$TABLE_NAME where #$EMAIL = $email and #$PASSWORD=$password"
      .as(SqlParser.int(1).single) > 0
  }

  def getUser2Team(selectId: String, isLeftToRight: Boolean)(implicit connection: Connection): List[String] = {

    println("HERE WE ARE: " + selectId)
    val selectFieldName = if (isLeftToRight) USER_ID else TEAM_ID
    val returnFieldName = if (isLeftToRight) TEAM_ID else USER_ID

    println("isLeftToRight: " + isLeftToRight)
    println("returnFieldName: " + returnFieldName)
    println("selectFieldName: " + selectFieldName)
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
