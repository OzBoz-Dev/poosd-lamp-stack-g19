<?php

    $inData = getRequestInfo();


    $conn = new mysqli("localhost", "lamp_G19", "WeLoveCOP4331", "ContactManager");

    if($conn->connect_error)
    {
        returnWithError($conn->connect_error, 500);
    }

    else
    {

        $stmt = $conn->prepare("SELECT firstname, lastname, phone FROM Contacts WHERE firstname LIKE ? OR lastname LIKE ? OR phone like ?");
        $query = "%" . $inData["search"] . "%";
        $stmt->bind_param("sss", $query, $query, $query);
        $stmt->execute();

        $result = $stmt->get_result();
        $searchResults = array();


        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()){
                $searchResults[] = $row;
            }
        }

        sendResultInfoAsJson(json_encode($searchResults));

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

    function returnWithError($err, $code)
    {
        http_response_code($code);
        $retValue = '{"error: "' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }



?>