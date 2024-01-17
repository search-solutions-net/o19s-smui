package controllers.auth

import models.{SearchManagementRepository, Session, SessionDAO}
import play.api.mvc._
import play.api.{Configuration, Logging}

import java.time.{LocalDateTime, ZoneOffset}
import scala.concurrent.{ExecutionContext, Future}

class UsernamePasswordAuthenticatedAction (adminRequired: Boolean, searchManagementRepository: SearchManagementRepository, parser: BodyParsers.Default, appConfig: Configuration)(implicit ec: ExecutionContext)
  extends ActionBuilderImpl(parser) with Logging {

  logger.debug("In UsernamePasswordAuthenticatedAction")

  val whiteListedPutPathRegexes: Set[String] = Set(
    "^/api/v1/user$"                   // user signup
  )
  val whiteListedGetPathRegexes: Set[String] =
    Set(
      "^/$",
      "^/api/v1/featureToggles$",
      "^/api/v1/version/latest-info$",
      "^/api/v1/solr-index$",
      "^/api/v1/-1/suggested-solr-field$",
      "^/api/v1/-1/rules-and-spellings$",
      "^/.*.js$",
      "^/.*.ico$",
      "^/.*.css$"
    )

  def requestAuthenticated(sessionOpt: Option[Session]): Boolean = {
    if (sessionOpt.isEmpty
      || sessionOpt.get.expiration.isBefore(LocalDateTime.now(ZoneOffset.UTC))) {
      return false
    }
    val user = searchManagementRepository.lookupUserByEmail(sessionOpt.get.tokenData)
    user match {
      case None => false
      case Some(user) => (!adminRequired || user.admin)
      case _ => false
    }
  }

  /**
   * Helper method to verify, that the request is basic authenticated with configured user/pass.
   * Code is adopted from: https://github.com/pedrorijo91/play-auth-example
   *
   * @param request
   * @return {{true}}, for user is authenticated.
   */
  override def invokeBlock[A](request: Request[A], block: Request[A] => Future[Result]): Future[Result] = {
    logger.debug(s":: invokeBlock :: request.path = ${request.path}")
    val sessionTokenOpt = request.session.get("sessionToken")
    val sessionOpt = SessionDAO.getSession(sessionTokenOpt.getOrElse("##"))
    val isRequestAuthenticated = requestAuthenticated(sessionOpt)
    if (isRequestAuthenticated
      || (request.method.equals("GET")
        && whiteListedGetPathRegexes.toStream.filter(s => request.path.matches(s)).headOption.nonEmpty)
      || (request.method.equals("PUT")
        && whiteListedPutPathRegexes.toStream.filter(s => request.path.matches(s)).headOption.nonEmpty)
        ) {
      logger.debug("Request authed for: " + request.path + " (token = " + sessionTokenOpt + ")")
      if (isRequestAuthenticated) {
        sessionOpt.exists(session => SessionDAO.resetSession(session))
      }
      block(request)
    } else {
      logger.info("lets take you to the session_reset screen from " + request.path + " (" + sessionTokenOpt + ")")
      Future {
        Results.Unauthorized("{\"action\":\"redirect\",\"params\":\"/\"}")
      }
    }
  }
}
