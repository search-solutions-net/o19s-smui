package controllers.auth

import models.SearchManagementRepository
import models.SessionDAO
import models.User

import javax.inject.Inject
import play.api.{Configuration, Logging}
import play.api.mvc._

import java.time.LocalDateTime
import java.time.ZoneOffset
import scala.concurrent.ExecutionContext

class AuthActionFactory @Inject()(parser: BodyParsers.Default, searchManagementRepository: SearchManagementRepository, appConfig: Configuration)(implicit ec: ExecutionContext) extends Logging {

  private def instantiateAuthAction(strClazz: String, defaultAction: ActionBuilder[Request, AnyContent]): ActionBuilder[Request, AnyContent] = {
    try {
      // TODO if possible instanciate authenticatedAction only once, not with every controller call
      def instantiate(clazz: java.lang.Class[_])(args: AnyRef*): AnyRef = {
        val constructor = clazz.getConstructors()(0)
        constructor.newInstance(args: _*).asInstanceOf[AnyRef]
      }
      var authenticatedAction: AnyRef = None
      if (strClazz.equals("controllers.auth.UsernamePasswordAuthenticatedAction")) {
        authenticatedAction = instantiate(
          java.lang.Class.forName(strClazz)
        )(searchManagementRepository, parser, appConfig, ec)
      } else {
        authenticatedAction = instantiate(
          java.lang.Class.forName(strClazz)
        )(parser, appConfig, ec)
      }
      logger.debug(":: having instanciated " + authenticatedAction.toString)
      authenticatedAction.asInstanceOf[ActionBuilder[Request, AnyContent]]

    } catch {
      case e: Throwable =>
        // TODO consider stop serving requests, if an expection during bootstrap of authAction happened. DO NOT return the defaultAction.

        logger.error(":: Exception during instantiation of smui.authAction :: " + e.getMessage)
        logger.error(":: Authentication protection IS NOT ACTIVE!")
        defaultAction
    }
  }

  def getAuthenticatedAction(defaultAction: ActionBuilder[Request, AnyContent]): ActionBuilder[Request, AnyContent] = {
    appConfig.getOptional[String]("smui.authAction") match {
      case Some(strClazz: String) =>
        if (strClazz.trim().equals("scala.None")) defaultAction
        else instantiateAuthAction(strClazz, defaultAction)
      case None =>
        defaultAction
    }
  }

  def getCurrentUser(request: Request[AnyContent]): Option[User] = {
    appConfig.getOptional[String]("smui.authAction") match {
      case Some(strClazz: String) =>
        if (strClazz.trim().equals("scala.None")) Option.empty
        else extractUser(request)
      case None =>
        Option.empty
    }
  }

  def extractUser(req: RequestHeader): Option[User] = {
    val sessionTokenOpt = req.session.get("sessionToken")
    sessionTokenOpt
      .flatMap(token => SessionDAO.getSession(token))
      .filter(_.expiration.isAfter(LocalDateTime.now(ZoneOffset.UTC)))
      .map(_.tokenData)
      .flatMap(searchManagementRepository.lookupUserByEmail)
  }

}
