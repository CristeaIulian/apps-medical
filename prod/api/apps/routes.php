<?php

$routes = [
    "/^\/api\/(analysis)$/",
    "/^\/api\/(analysis)\/(getAnalysisList)$/",
    "/^\/api\/(analysis)\/(add)$/",
    "/^\/api\/(analysis)\/(update)$/",
    "/^\/api\/(analysis)\/(updateOptimalRange)\/(\d+)$/",

    "/^\/api\/(analysis)\/(delete)\/(\d+)$/",

    "/^\/api\/(analysisLog)$/",
    "/^\/api\/(analysisLog)\/(getByType)\/(\d+)$/",
    "/^\/api\/(analysisLog)\/(add)$/",
    "/^\/api\/(analysisLog)\/(delete)\/(\d+)$/",

    "/^\/api\/(categories)$/",
    "/^\/api\/(categories)\/(get)\/(\d+)$/",
    "/^\/api\/(categories)\/(add)$/",
    "/^\/api\/(categories)\/(update)$/",
    "/^\/api\/(categories)\/(delete)\/(\d+)$/",

    "/^\/api\/(clinics)$/",
    "/^\/api\/(clinics)\/(get)\/(\d+)$/",
    "/^\/api\/(clinics)\/(add)$/",
    "/^\/api\/(clinics)\/(update)$/",
    "/^\/api\/(clinics)\/(delete)\/(\d+)$/",
];
