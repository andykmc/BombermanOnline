<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

class SimpleDB{

	var $dbh;
	var $dbIP = 'localhost';
	var $dbName = 'bomberman';
	var $dbLoginName = 'root';
	var $dbPassword = 'fr5zbbqf';
	var $sessionTable = 'bbm_session';
	var $accountTable = 'bbm_account';
	//const session_duration = 20;//20s for experimental use
	
	function __construct(){
		$this->dbh = new PDO("mysql:host=$this->dbIP;dbname=$this->dbName", $this->dbLoginName, $this->dbPassword);
	}

	function getLoginTime($usr_session){
		//=========get DB expiry time =========
        $query = $this->dbh->prepare("SELECT login_time FROM $this->sessionTable WHERE session=?");    
        $query->execute(array($usr_session));
        $db_login_time = $query->fetch(PDO::FETCH_ASSOC);//e.g. 2013-04-25 07:13:12
		if ($db_login_time != null){
			return strtotime($db_login_time['login_time']);
		}else{
			return null;
		}
	}
	
	function getPassword($id){
		$query = $this->dbh->prepare("SELECT password FROM $this->accountTable WHERE id=?");
		$query->execute(array($id));
		$db_pwd = $query->fetch(PDO::FETCH_ASSOC);
		if ($db_pwd != null){
			return $db_pwd['password'];
		}else{
			return null;
		}
	}
	
	function createSession($id, $persistent){
		//        ===prepare cookie===
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $session_key = null;
		$persistency = 0;
		if ($persistent == 'true'){
			$persistency = 1;
		}
		
        for ($i = 0; $i < 20; $i++){
            $session_key = $session_key.$characters[rand(0,strlen($characters)-1)];
        }
        $query = $this->dbh->prepare("SELECT session FROM $this->sessionTable WHERE id=?");
        $query->execute(array($id));
        $result = $query->fetch();
        
        if ($result != null){
            //clear any old session
            $query = $this->dbh->prepare("DELETE FROM $this->sessionTable WHERE id=?");
            $query->execute(array($id));
        }
            //append session		
        $login_time = time();
        $query = $this->dbh->prepare("INSERT INTO $this->sessionTable (id, session, login_time, persistent) VALUES (?,?,?,?)");
        $query->execute(array($id, $session_key, date('Y-m-d H:i:s',$login_time), $persistency));
        //        ====================
		return $session_key;
	}
	
	function getSessionKeyBySession($usr_session){
		//    =========get DB session key===========    
		$query = $this->dbh->prepare("SELECT session FROM $this->sessionTable WHERE session=?");
		$query->execute(array($usr_session));
		$db_session = $query->fetch(PDO::FETCH_ASSOC);
		if ($db_session != null){
			return $db_session['session'];
		}else{
			return null;
		}
	}
	
	function updateSession($usr_session){
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$session_key = null;
		
		//prepare session key
		for ($i = 0; $i < 20; $i++){
            $session_key = $session_key.$characters[rand(0,strlen($characters)-1)];
        }
		//=====update session key=====
        $new_login_time = time();        
        $query = $this->dbh->prepare("UPDATE $this->sessionTable SET login_time=?, session=? WHERE session=?");
        $query->execute(array(date('Y-m-d H:i:s',$new_login_time), $session_key, $usr_session));
		
		return $session_key;
	}
	
	function removeSessionBySession($usr_session){
		//remove the session when logout
		$query = $this->dbh->prepare("DELETE FROM $this->sessionTable WHERE session=?");
        $query->execute(array($usr_session));
	}
	
	function getIdById($id_entry){
		$query = $this->dbh->prepare('SELECT id FROM '.$this->accountTable.' WHERE id=?');
		$query->execute(array($id_entry));
		$id = $query->fetch(PDO::FETCH_ASSOC);
		if ($id != null){
			return $id['id'];
		}else{
			return null;
		}
	}
	
	function getIdBySession($usr_session){
		$query = $this->dbh->prepare('SELECT id FROM '.$this->sessionTable.' WHERE session=?');
		$query->execute(array($usr_session));
		$id = $query->fetch(PDO::FETCH_ASSOC);
		if ($id != null){
			return $id['id'];
		}else{
			return null;
		}
	}
	
	function getPersistentBySession($usr_session){
		$query = $this->dbh->prepare('SELECT persistent FROM '.$this->sessionTable.' WHERE session=?');
		$query->execute(array($usr_session));
		$persistent = $query->fetch(PDO::FETCH_ASSOC);
		if ($persistent != null){
			return $persistent['persistent'];
		}else{
			return 0;
		}		
	}
        
	function createAccount($id, $pwd){
		$query = $this->dbh->prepare("INSERT INTO $this->accountTable (id, password, level, win, loss) VALUES (?,?,?,?,?)");
		$query->execute(array($id,$pwd,1,0,0));
		if ($query == true){
            //Account ID creation success            
            //echo "Success";
			return true;            
        }else{
            //Account ID creation failed
            //echo "Fail";
			return false;
        }
	}
}

/*
#Test updateSessionKey()
	$MyDB = new SimpleDB();
	$sessionKey = $MyDB->updateSessionKey('7DxPE0WrUo1ZL52U6ZJC');
*/
/*
#Test getSessionKey()
	$MyDB = new SimpleDB();
	$sessionKey = $MyDB->getSessionKey('1');
	echo $sessionKey['session'];
	
#Test getSessionExpiryTime()
	$MyDB = new SimpleDB();
	$login_time = $MyDB->getSessionExpiryTime('2');
	echo $login_time;
	*/
?>