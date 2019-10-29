main.floors.MT6=
{
    "floorId": "MT6",
    "title": "划水区 6层",
    "name": "6",
    "width": 13,
    "height": 13,
    "canFlyTo": true,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "images": [],
    "item_ratio": 1,
    "defaultGround": "ground",
    "firstArrive": [
        "此处蝙蝠颇难处理，射击模式更换解锁",
        "提示：直接点击射击处的文字，可以切换射击模式，佯攻（0伤0倍金币花费），单点（正常的1倍伤害，正常的1倍金币花费），多重（1.8倍伤害，2倍金币花费）",
        {
            "type": "addValue",
            "name": "item:modeSwitch",
            "value": "1"
        },
        {
            "type": "function",
            "function": "function(){\ncore.addArcherMode('easy');core.addArcherMode('hard');\n}"
        }
    ],
    "eachArrive": [],
    "parallelDo": "",
    "events": {},
    "changeFloor": {
        "5,10": {
            "floorId": ":next",
            "stair": "downFloor"
        },
        "11,6": {
            "floorId": ":before",
            "stair": "upFloor"
        }
    },
    "afterBattle": {},
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
    "map": [
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4],
    [  4,  4,  1,  1,  1,  4,  4,  1,  1,  1,  1,  4,  4],
    [  4,  4,  1,600,  1,  4,  1,  1,  0, 28,  1,  1,  4],
    [  4,  4,  1,  0,  1,  1,  1,  0,207,  0,205,  1,  4],
    [  4,  1,  1,215,  1,244,  1,  0,  1, 21,  0,  1,  1],
    [  4,  1,  0, 83,  0,  0,202,  0,206,  0,  0, 88,  1],
    [  4,  1, 27,  0, 81,  0,  0, 31,  0, 81,  1,  1,  1],
    [  4,  1,  1, 32,  1,  0,  1,  0, 81, 61,  1,  4,  4],
    [  4,  4,  1,  1,  1,201,  0,203, 29,  1,  1,  4,  4],
    [  4,  4,  4,  4,  1, 87,  0,  1,  1,  1,  4,  4,  4],
    [  4,  4,  4,  4,  1,  1,  1,  1,  4,  4,  4,  4,  4],
    [  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4,  4]
],
    "bgmap": [

],
    "fgmap": [

]
}