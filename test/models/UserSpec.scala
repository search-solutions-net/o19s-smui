package models

import org.h2.jdbc.JdbcBatchUpdateException
import org.scalatest.{BeforeAndAfterEach, FlatSpec, Matchers}
import services.HashService
import utils.WithInMemoryDB

class UserSpec extends FlatSpec with Matchers with BeforeAndAfterEach with WithInMemoryDB {

  val hashService: HashService = new HashService

  private val users = Seq(
    User.create("name1", "email1", Option("good rule")),
    User.create("name2", "email2", Option("MO"), admin = true),
    User.create("name3", "email3", Option("MO_DE"), admin = true),
    User.create("name4", "email4", Option("MO_AT"), admin = true)
  )

  // Accuracy of lastUpdate before/after database insert should omit nano seconds
  def adjustedTimeAccuracy(users: Seq[User]): Seq[User] = users.map(user =>
    user.copy(lastUpdate = Option(user.lastUpdate.get.withNano(0)))
  )

  "User" should "be saved to the database and read out again" in {
    db.withConnection { implicit connection =>
      User.insert(hashService, users: _*)
      val loaded = User.getUsers(Seq())
      adjustedTimeAccuracy(loaded).toSet shouldBe adjustedTimeAccuracy(users).toSet
    }

  }

  it should "not allow inserting the same email more than once" in {
    val user1 = User.create("name10", "email10", Option("good rule"))
    val user2 = User.create("name11", "email10", Option("good rule1"))
    db.withConnection { implicit connection =>
      intercept[JdbcBatchUpdateException] {
        User.insert(hashService, user1, user2)
      }
    }
  }

}
