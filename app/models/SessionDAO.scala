package models

import java.time.{LocalDateTime, ZoneOffset}
import java.util.UUID

import scala.collection.mutable

case class Session(token: String, email: String, expiration: LocalDateTime)

object SessionDAO {

  private val sessions= mutable.Map.empty[String, Session]

  def getSession(token: String): Option[Session] = {
    sessions.get(token)
  }

  def generateToken(email: String): String = {
    val token = s"$email-token-${UUID.randomUUID().toString}"
    sessions.put(token, Session(token, email, LocalDateTime.now(ZoneOffset.UTC).plusSeconds(30)))

    token
  }

}