<?php

	$inData = getRequestInfo();
	
	$conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager"); 	
	if( $conn->connect_error )
	{
		returnWithError($conn->connect_error, 500);
	}
	else
	{
		$stmt = $conn->prepare("SELECT id, firstname, lastname, phone FROM Contacts WHERE parent_id = ?");
		$stmt->bind_param("i", $inData["parent_id"]);
		$stmt->execute();
		$result = $stmt->get_result();
        $data = array();

		if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()){
                $data[] = $row;
            }
        }

        sendResultInfoAsJson(json_encode($data));

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