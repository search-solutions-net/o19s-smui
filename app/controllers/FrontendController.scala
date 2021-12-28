package controllers

import controllers.auth.AuthActionFactory
import play.api.Logging
import play.api.http.HttpErrorHandler
import play.api.mvc._

import javax.inject.Inject
import scala.concurrent.ExecutionContext

class FrontendController @Inject()(cc: MessagesControllerComponents,
                                   assets: Assets,
                                   errorHandler: HttpErrorHandler,
                                   authActionFactory: AuthActionFactory)(implicit executionContext: ExecutionContext)
  extends MessagesAbstractController(cc) with Logging {

  def index(): Action[AnyContent] = authActionFactory.getAuthenticatedAction(Action).async { request =>
    assets.at("index.html")(request)
  }

  def assetOrDefault(resource: String): Action[AnyContent] = authActionFactory.getAuthenticatedAction(Action).async { request =>
    if (resource.startsWith("api")) {
      errorHandler.onClientError(request, NOT_FOUND, "Not found")
    } else {
      if (resource.contains(".")) {
        assets.at(resource)(request)
      } else {
        assets.at("index.html")(request)
      }
    }
  }

}
