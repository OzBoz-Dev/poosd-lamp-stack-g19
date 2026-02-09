<?php
    $inData = getRequestInfo();
   
    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");
    $parent_id = -1;
    $id = -1;

    if ($conn -> connect_error){
        returnWithError($conn->connect_error);
    }
    else {
        $id = $inData["id"];
        $parent_id = $inData["parent_id"];

        $stmt = $conn->prepare("SELECT parent_id FROM Contacts WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
		$result = $stmt->get_result();
        if($row = $result->fetch_assoc())
		{
			if ($row['parent_id'] == $parent_id){
				 $stmt = $conn->prepare("DELETE FROM Contacts WHERE id = ?");
                $stmt->bind_param("i", $id);

                $contactDeleted = $stmt->execute();

                if($contactDeleted){
                    returnwithInfo("Contact Deleted");
                }
                else{
                    returnWithError("Contact could not be deleted", 400);
                }
			}
			else {
			    	returnWithError("This parent ID is not allowed to delete this contact", 401);
			}
		}
        else {
            returnWithError("Not a valid contact ID", 404);
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

    function returnwithInfo($message){
        http_response_code(204);
        $retValue = '{"message":' . $message . '}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithError($err, $code){
        http_response_code($code);
        $retValue = '{"error: "' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

?>