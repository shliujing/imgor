<?php

require_once('config/database.php');

class Database
{
    private $pdo;

    public function __construct($host, $port, $database, $username, $password)
    {
        try {
            $this->pdo = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4", $username, $password);
        } catch (PDOException $e) {
            print "Error!: " . $e->getMessage();
            die();
        }
    }

    function insertImage($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO image (ip, url) VALUES (:ip, :url)");
        $stmt->bindParam(':ip', $data["ip"]);
        $stmt->bindParam(':url', $data["url"]);
        $stmt->execute();
    }

    function getImage($limit)
    {
        $stmt = $this->pdo->prepare("SELECT url FROM image ORDER BY id DESC LIMIT :limit");
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_CLASS);
    }
}

$database = new Database($config["host"], $config["port"], $config["database"], $config["username"], $config["password"]);

switch ($_GET['m']) {
    case 'g': {
        getData();
        break;
    }
    case 'r': {
        if ($_SERVER['REQUEST_METHOD'] == "POST") {
            recordData();
        } else {
            return http_response_code(404);
        }
        break;
    }
    default: {
        return http_response_code(404);
    }
}

function getData()
{
    global $database;
    header("Content-Type:application/json;charset=utf-8");
    $limit = 20;
    if (isset($_GET['limit'])) {
        $limit = intval($_GET['limit']);
    }
    $rows = $database->getImage($limit);
    echo json_encode($rows);
}

function recordData()
{
    global $database;

    $data = file_get_contents("php://input");
    $json = json_decode($data, true);

    if (!$json['url'] || strpos($json['url'], "cdn.sohucs.com") == false) {
        return http_response_code(400);
    }

    $database->insertImage([
        "url" => $json['url'],
        "ip" => getClientIP()
    ]);
}

function getClientIP()
{
    $client = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote = $_SERVER['REMOTE_ADDR'];

    if (filter_var($client, FILTER_VALIDATE_IP)) {
        $ip = $client;
    } elseif (filter_var($forward, FILTER_VALIDATE_IP)) {
        $ip = $forward;
    } else {
        $ip = $remote;
    }

    return $ip;
}