main.floors.MT5=
{
    "floorId": "MT5",
    "title": "划水区 5层",
    "name": "5",
    "width": 13,
    "height": 13,
    "canFlyTo": true,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "images": [],
    "item_ratio": 1,
    "defaultGround": "ground",
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {},
    "changeFloor": {
        "1,6": {
            "floorId": ":before",
            "stair": "upFloor"
        },
        "11,6": {
            "floorId": ":next",
            "stair": "downFloor"
        }
    },
    "afterBattle": {
        "7,3": [
            {
                "type": "if",
                "condition": "flag:51==0",
                "true": [
                    {
                        "type": "addValue",
                        "name": "flag:51",
                        "value": "1"
                    },
                    {
                        "type": "addValue",
                        "name": "flag:5",
                        "value": "1"
                    },
                    {
                        "type": "if",
                        "condition": "flag:5==3",
                        "true": [
                            {
                                "type": "openDoor",
                                "loc": [
                                    7,
                                    2
                                ]
                            },
                            {
                                "type": "hideBgFgMap",
                                "name": "bg"
                            }
                        ],
                        "false": []
                    }
                ],
                "false": []
            }
        ],
        "6,2": [
            {
                "type": "if",
                "condition": "flag:52==0",
                "true": [
                    {
                        "type": "addValue",
                        "name": "flag:52",
                        "value": "1"
                    },
                    {
                        "type": "addValue",
                        "name": "flag:5",
                        "value": "1"
                    },
                    {
                        "type": "if",
                        "condition": "flag:5==3",
                        "true": [
                            {
                                "type": "openDoor",
                                "loc": [
                                    7,
                                    2
                                ]
                            },
                            {
                                "type": "hideBgFgMap",
                                "name": "bg"
                            }
                        ],
                        "false": []
                    }
                ],
                "false": []
            }
        ],
        "5,3": [
            {
                "type": "if",
                "condition": "flag:53==0",
                "true": [
                    {
                        "type": "addValue",
                        "name": "flag:53",
                        "value": "1"
                    },
                    {
                        "type": "addValue",
                        "name": "flag:5",
                        "value": "1"
                    },
                    {
                        "type": "if",
                        "condition": "flag:5==3",
                        "true": [
                            {
                                "type": "openDoor",
                                "loc": [
                                    7,
                                    2
                                ]
                            },
                            {
                                "type": "hideBgFgMap",
                                "name": "bg"
                            }
                        ],
                        "false": []
                    }
                ],
                "false": []
            }
        ]
    },
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
    "map": [
    [  4,  4,  4,  4,  4,  4,  1,  1,  1,  1,  4,  4,  4],
    [  4,  4,  4,  4,  1,  1,  1, 61, 27,  1,  4,  4,  4],
    [  4,  4,  4,  4,  1,  0,206, 85,  1,  1,  4,  4,  4],
    [  4,  4,  1,  1,  1,206,  0,206, 31,  1,  4,  4,  4],
    [  4,  1,  1,244,  1,  0,  0,  0,219, 81,  1,  1,  4],
    [  1,  1,601,  0,  1,  0, 29,  0,  1,207,  0,  1,  1],
    [  1, 88,  0,  0,  0,202,  0,  0,  0,  0,  0, 87,  1],
    [  1,  1,  1,  1, 82,  1,  0,  1, 81,  1,  0,  0,  1],
    [  4,  4,  1,  0, 28, 81, 31,  0,  0,  0,  0,  1,  1],
    [  4,  4,  1, 34,204,  1,250,  1, 61, 63, 31,  1,  4],
    [  4,  4,  1,  1, 21,  1,  1,  1,  1,  1,  1,  1,  4],
    [  4,  4,  4,  1,  1,  1,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4]
],
    "bgmap": [
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0, 16,  0, 16,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
],
    "fgmap": [

]
}