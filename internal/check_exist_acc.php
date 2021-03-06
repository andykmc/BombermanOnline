<?php
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
	include("../internal/dbms.php");
	include("../internal/myPath.php");

    #$index_url = '../index/index.php';
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';	

    //Redirect any abnormal access on this page to index.php
    if (!(isset($_GET["id_entry"])) || !(isset($_GET["id_entry"]))){
        header("Location:http://$my_host:$http_port$index_url");
        exit;
    }

    $id_entry = $_GET["id_entry"];

    //validate the id_entry only contains valid characters
    for ($i = 0; $i < strlen($id_entry); $i++){
        if (strpos($characters, $id_entry[$i]) == false){
			echo 'Invalid ID';
            exit;
        }
    }

    $myDB = new SimpleDB();
	$result = $myDB->getIdById($id_entry);

    if ($result != null){
		echo 'Same ID already in use';
    }else{
		echo 'Valid ID';
    }
?>