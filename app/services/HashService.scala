package services

import io.github.nremond.SecureHash

class HashService {

  trait PasswordHashRoutine {
    def createPasswordHash(password: String): String
    def validatePassword(password: String, hashedPassword: String): Boolean
  }

  // list of password hash routines; the last entry is used for new password entries
  val passwordHashRoutines: List[PasswordHashRoutine] = List(
    new PasswordHashRoutineDummy,
    new PBKDF2_HmacSHA512(120000, 32, "HmacSHA512", 24)
  )

  class PasswordHashRoutineDummy() extends PasswordHashRoutine {
    override def createPasswordHash(password: String): String = password
    override def validatePassword(password: String, hashedPassword: String): Boolean = (password == hashedPassword)
  }

  class PBKDF2_HmacSHA512(iterations: Int,
                          dkLength: Int,
                          cryptoAlgo: String,
                          saltLength: Int
                         ) extends PasswordHashRoutine {
    val this.iterations = iterations
    val this.dkLength = dkLength
    val this.cryptoAlgo = cryptoAlgo
    val this.saltLength = saltLength

    override def createPasswordHash(password: String): String = {
      SecureHash.createHash(password, iterations, dkLength, cryptoAlgo, saltLength)
    }
    override def validatePassword(password: String, hashedPassword: String): Boolean = {
      SecureHash.validatePassword(password, hashedPassword)
    }
  }

  def createPasswordHash(password: String): String = {
    passwordHashRoutines(passwordHashRoutineId).createPasswordHash(password) // index of last element in list
  }

  def passwordHashRoutineId: Int = {
    passwordHashRoutines.size - 1 // index of last element in list
  }

  def validatePassword(hashRoutine: Int, password: String, hashedPassword: String): Boolean = {
    passwordHashRoutines(hashRoutine).validatePassword(password, hashedPassword)
  }

}
