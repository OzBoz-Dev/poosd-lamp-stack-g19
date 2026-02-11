<?php
    $inData = getRequestInfo();

    $id = 0;
    $firstName = "";
    $lastName = "";
    $email = "";
    $passsword = "";
   

    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");

    if ($conn -> connect_error){
        return WithError($conn->connect_error);
    }

    else{
        $firstName = $inData["firstName"];
        $lastName = $inData["lastName"];
        $email = $inData["email"];
        $password = password_hash($inData["password"], PASSWORD_DEFAULT);


        
        $check = $conn->prepare("SELECT email FROM Users WHERE email = ?");
        $check->bind_param("s", $inData["email"]);


        $check->execute();
        $result = $check->get_result();


        if ($row = $result->fetch_assoc()){
            returnWithError("Email already in use", 409);
        }

        else{
            $stmt = $conn->prepare("INSERT INTO Users (firstname, lastname, email, password) VALUES(?, ?, ?, ?)");
            $stmt->bind_param("ssss", $firstName, $lastName, $email, $password);


            $accountCreated = $stmt->execute();

            if($accountCreated){
                returnwithInfo("Account created successfully");
            }
            else{
                returnWithError("Account could not be created", 400);
            }
            
        }

        $stmt->close();
        $check->close();
        $conn->close();



    }


    function getRequestInfo(){
        return json_decode(file_get_contents('php://input'), true);
    }


    function sendResultInfoAsJson($obj){
        header('Content-type: application/json');
        echo $obj;
    }

    function returnwithInfo($message){
        $retValue = '{"message": "'.$message.'"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithError($err, $code){
        http_response_code($code);
        $retValue = '{"error": "' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

   

?>