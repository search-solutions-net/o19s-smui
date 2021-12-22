package models

import play.api.libs.json._

import scala.collection.mutable

/**
  * Defines an auth info nmodel
  */
case class AuthInfo(currentUser: User,
                    teams: List[String],
                    solrIndices: List[String],
                    isLoginRequired: Boolean,
                    isLoggedIn: Boolean,
                    authAction: String
                        ) {
}

object AuthInfo {

  implicit val jsonReads: Reads[AuthInfo] = Json.reads[AuthInfo]
  private val defaultWrites: OWrites[AuthInfo] = Json.writes[AuthInfo]
  implicit val jsonWrites: OWrites[AuthInfo] = OWrites[AuthInfo] { model =>
    defaultWrites.writes(model)
  }

  def create(currentUser: User,
             teams: List[String],
             solrIndices: List[String],
             isLoginRequired: Boolean,
             isLoggedIn: Boolean,
             authAction: String
            ): AuthInfo = {
    AuthInfo(currentUser, unique(teams), unique(solrIndices), isLoginRequired, isLoggedIn, authAction)
  }

  def unique[A](ls: List[A]) = {
    def loop(set: Set[A], ls: List[A]): List[A] = ls match {
      case hd :: tail if set contains hd => loop(set, tail)
      case hd :: tail => hd :: loop(set + hd, tail)
      case Nil => Nil
    }

    loop(Set(), ls)
  }

  implicit def listToSyntax[A](ls: List[A]) = new {
    def uniqueList = unique(ls)
  }


}
