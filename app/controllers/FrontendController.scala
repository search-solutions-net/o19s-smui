package controllers

import controllers.auth.AuthActionFactory
import controllers.helpers.UserAction
import controllers.helpers.UserRequest
import models.FeatureToggleModel.FeatureToggleService
import models.SearchManagementRepository
import models.{FeatureToggleModel, SessionDAO, SolrIndexId, User}
import play.api.Logging
import play.api.http.HttpErrorHandler
import play.api.libs.json.{Format, JsValue, Json}
import play.api.mvc._

import java.sql.BatchUpdateException
import javax.inject.Inject
import scala.concurrent.{ExecutionContext, Future}

class FrontendController @Inject()(cc: MessagesControllerComponents,
                                   assets: Assets,
                                   featureToggleService: FeatureToggleService,
                                   val userAction: UserAction,
                                   searchManagementRepository: SearchManagementRepository,
                                   errorHandler: HttpErrorHandler,
                                   authActionFactory: AuthActionFactory)(implicit executionContext: ExecutionContext)
  extends MessagesAbstractController(cc) with Logging with play.api.i18n.I18nSupport {

  object UserInfo {
    // Use a JSON format to automatically convert between case class and JsObject
    implicit val format: Format[User] = Json.format[User]
  }

  def index(): Action[AnyContent] = authActionFactory.getAuthenticatedAction(Action).async { request =>
    assets.at("index.html")(request)
  }

  def public() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.public())
  }

  def sessionReset(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.session_reset(LoginForm.form, SignupForm.form, featureToggleService.getSmuiHeadline))
  }

  def priv(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    withUser(user => Ok(views.html.priv(user)))
  }

  def privPlay(): EssentialAction = withPlayUser { user =>
    Ok(views.html.priv(user))
  }

  def privAction(): Action[AnyContent] = userAction { user: UserRequest[AnyContent] =>
    Ok(views.html.priv(user.user.get))
  }

  def priv2(): Action[AnyContent] = authActionFactory.getAuthenticatedAction(Action).async { request =>
    Future(Ok(views.html.priv2()))
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

  def signup() = Action { implicit request: Request[AnyContent] =>
    val headline = featureToggleService.getSmuiHeadline
    val signupForm = SignupForm.form.bindFromRequest
    signupForm.fold(
      formWithErrors => {
        BadRequest(views.html.session_reset(LoginForm.form, formWithErrors, headline))
      },
      userData => {
        try {
          Option(searchManagementRepository.addUser(
            User.create(
              name = userData.name,
              email = userData.email,
              password = userData.password,
              admin = searchManagementRepository.getUserCount() == 0) // set first registering user as admin
          ))
            .map(_ => processValidLogin(request, userData.email))
            .getOrElse(
              BadRequest(
                views.html.session_reset(
                  LoginForm.form,
                  signupForm.withError("email", "Could not create this user"),
                  headline)
              )
            )
        } catch {
          case e: BatchUpdateException => BadRequest(views.html.session_reset(LoginForm.form, signupForm.withError("email", "Could not create this user"), headline))
        }
      }
    )
  }

  def login = Action { implicit request: Request[AnyContent] =>
    val headline = featureToggleService.getSmuiHeadline
    val loginForm = LoginForm.form.bindFromRequest
    loginForm.fold(
      formWithErrors => {
        BadRequest(views.html.session_reset(formWithErrors, SignupForm.form, headline))
      },
      userData => {
        if (searchManagementRepository.isValidEmailPasswordCombo(userData.email, userData.password))
          processValidLogin(request, userData.email)
        else
          BadRequest(
            views.html.session_reset(
              loginForm.withError("password", "Invalid email / password combination"),
              SignupForm.form,
              headline)
          )
      }
    )
  }

  private def processValidLogin(request: Request[AnyContent], email: String) = {
    Redirect(routes.FrontendController.index()).withSession(request.session + ("sessionToken" -> SessionDAO.generateToken(email)))
  }

  def logout() = Action { implicit request: Request[AnyContent] =>
    Redirect(routes.FrontendController.sessionReset()).withNewSession
  }

  private def withPlayUser[T](block: User => Result): EssentialAction = {
    Security.WithAuthentication(authActionFactory.extractUser)(user => Action(block(user)))
  }

  private def withUser[T](block: User => Result)(implicit request: Request[AnyContent]): Result = {
    val user = authActionFactory.extractUser(request)
    user
      .map(block)
      .getOrElse(Unauthorized(views.html.defaultpages.unauthorized())) // 401, but 404 could be better from a security point of view
  }

}
