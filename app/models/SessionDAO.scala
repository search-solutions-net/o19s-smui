package models

import java.time.{LocalDateTime, ZoneOffset}
import java.util.UUID
import scala.collection.mutable

case class Session(token: String, tokenData: String, timeout: Long, expiration: LocalDateTime) {

}

object SessionDAO {

  private val sessions= mutable.Map.empty[String, Session]

  def getSession(token: String): Option[Session] = {
    sessions.get(token)
  }

  def generateToken(tokenData: String, timeoutMinutes: Long): String = {
    val token = s"$tokenData-token-${UUID.randomUUID().toString}"
    // TODO make session expiration timeout configurable
    sessions.put(token, Session(token, tokenData, timeoutMinutes, getExpiration(timeoutMinutes)))

    token
  }

  def resetSession(session: Session): Boolean = {
    sessions.put(session.token, session.copy(expiration = getExpiration(session.timeout))).isDefined
  }

  private def getExpiration(timeoutMinutes: Long): LocalDateTime = {
    LocalDateTime.now(ZoneOffset.UTC).plusMinutes(timeoutMinutes)
  }

}