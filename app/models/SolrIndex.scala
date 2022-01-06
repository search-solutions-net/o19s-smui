package models

import java.sql.Connection
import java.util.Date

import play.api.libs.json.{Json, OFormat}
import anorm.SqlParser._
import anorm._
import play.api.Logging

class SolrIndexId(id: String) extends Id(id)
object SolrIndexId extends IdObject[SolrIndexId](new SolrIndexId(_))

case class SolrIndex(id: SolrIndexId = SolrIndexId(),
                     name: String,
                     description: String) {

}

object SolrIndex {

  val TABLE_NAME = "solr_index"

  implicit val jsonFormat: OFormat[SolrIndex] = Json.format[SolrIndex]

  val sqlParser: RowParser[SolrIndex] = get[SolrIndexId](s"$TABLE_NAME.id") ~
    get[String](s"$TABLE_NAME.name") ~
    get[String](s"$TABLE_NAME.description") map { case id ~ name ~ description =>
    SolrIndex(id, name, description)
  }

  /**
    * List all Solr Indeces the SearchInput's can be configured for
    *
    * @return List[SolrIndex]
    */
  def getSolrIndexes(ids: Seq[String]) (implicit connection: Connection): List[SolrIndex] = {
    val isLoadAll = (ids.isEmpty)
    val idsString = ids.mkString("'","','","'")
    SQL(s"select * from $TABLE_NAME where $isLoadAll or id in ($idsString) order by name asc")
      .as(sqlParser.*)
  }

  def loadNameById(solrIndexId: SolrIndexId) (implicit connection: Connection): String = {
    val solrIndex = getSolrIndexes(Seq(solrIndexId.id)).headOption
    if (solrIndex.nonEmpty)
      solrIndex.get.name
    else
      ""
  }

  def insert(newSolrIndex: SolrIndex)(implicit connection: Connection): SolrIndexId = {
    SQL"insert into #$TABLE_NAME (id, name, description, last_update) values (${newSolrIndex.id}, ${newSolrIndex.name}, ${newSolrIndex.description}, ${new Date()})".execute()
    newSolrIndex.id
  }

  def delete(id: String)(implicit connection: Connection): Int = {
    SQL"delete from #$TABLE_NAME where id = $id".executeUpdate()
  }


}
