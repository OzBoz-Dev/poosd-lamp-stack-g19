<?php
    $inData = getRequestInfo();

    $id = 0;
    $parent_id = 0;
    $firstName = "";
    $lastName = "";
    $email = "";
    $phone = "";
    $company = "";
   

    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");

    if ($conn -> connect_error){
        returnWithError($conn->connect_error);
    }
    else {
        $parent_id = $inData["parent_id"];
        $firstName = $inData["firstname"];
        $lastName = $inData["lastname"];
        $email = $inData["email"];
        $phone = $inData["phone"];
        $company = $inData["company"];

        $stmt = $conn->prepare("INSERT INTO Contacts (parent_id, firstname, lastname, email, phone, company) VALUES(?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $parent_id, $firstName, $lastName, $email, $phone, $company);


        $contactCreated = $stmt->execute();

        if($contactCreated){
            $id = $conn->insert_id;
            returnwithInfo("Contact created successfully", $id);
        }
        else{
            returnWithError("Contact could not be created", 400);
        }

        $stmt->close();
        $conn->close();
    }


    function getRequestInfo(){
        return json_decode(file_get_contents('php://input'), true);
    }


    function sendResultInfoAsJson($obj){
        header('Content-type: application/json');
        echo $obj;
    }

    function returnwithInfo($message, $id){
        http_response_code(201);
        $retValue = '{"id":' . $id . ',"message":' . $message . '}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithError($err, $code){
        http_response_code($code);
        $retValue = '{"error: "' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

?>