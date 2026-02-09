<?php

    $inData = getRequestInfo();
    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");
	$parent_id = -1;
    $id = -1;


    if($conn->connect_error)
    {
        returnWithError($conn->connect_error, 500);
    }
	
	else
	{
		$parent_id = $inData["parent_id"];
   		$id = $inData["id"];
		$stmt = $conn->prepare("SELECT parent_id FROM Contacts where id = ?");
		$stmt->bind_param("i", $id);
		$stmt->execute();
		$result = $stmt->get_result();

        if($row = $result->fetch_assoc())
		{
			if ($row['parent_id'] == $parent_id){
				$stmt = $conn->prepare("SELECT firstname, lastname, phone, email, company FROM Contacts where id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
		        $result = $stmt->get_result();
                if($row = $result->fetch_assoc()){
                    sendResultInfoAsJson(json_encode($row));
                }
			}
			else {
			    	returnWithError("This parent ID is not allowed to access this contact", 401);
			}
		}
        else {
            returnWithError("Not a valid contact ID", 404);
        }

		$stmt->close();
		$conn->close();

	}


	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err , $code)
	{
		http_response_code($code);
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>