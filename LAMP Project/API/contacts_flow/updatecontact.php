<?php


    $inData = getRequestInfo();
    $parent_id = -1;
    $id = -1;



    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");


    if($conn->connect_error)
    {
        returnWithError($conn->connect_error, 500);
    }
    else
    {
        $id = $inData["id"];
        $parent_id = $inData["parent_id"];
        $firstname = $inData["firstname"];
        $lastname = $inData["lastname"];
        $email = $inData["email"];
        $phone = $inData["phone"];
        $company = $inData["company"];
        
        $stmt = $conn->prepare("SELECT parent_id FROM Contacts WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result();

        if($row = $result->fetch_assoc())
        {

            if($row['parent_id'] == $parent_id)
            {
                $stmt = $conn->prepare("UPDATE Contacts SET firstname = ?, lastname = ?, email = ?, phone = ?, company = ? WHERE id = ?");
                $stmt->bind_param("sssssi", $firstname, $lastname, $email, $phone, $company, $id);


                $check = $stmt->execute();

                if($check)
                {
                    returnWithInfo("Contact updated successfully.");
                }
                else
                {
                    returnWithError("Contact could not be updated. Check for formatting issues", 400);
                }
            }

            else
            {
                returnWithError("This parent id cannot update this contact", 401);
            }


        
        }

        else
        {
            returnWithError("Not a valid contact ID", 404);
        }

        $stmt->close();
        $conn->close();



    }



    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }


    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnwithInfo($message){

        $retValue = '{"'.$message.'"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithError($err, $code)
    {
        http_response_code($code);
        $retValue = '{"error: "' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }


?>