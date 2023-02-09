import { _decorator, Component, Node } from 'cc'
import { EVENT_ENUM } from '../../Enum'
import levels, { ILevel } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { createUINode } from '../../Util'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
const { ccclass } = _decorator

import { TileMapManager } from '../Tile/TileMapManager'

@ccclass('BattleManager')
export class BattleManager extends Component {
    level: ILevel
    stage: Node

    onLoad() {
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    }

    start() {
        this.generateStage()
        this.initLevel()
    }

    initLevel() {
        const level = levels[`level${DataManager.Instance.levelIndex}`]
        if (level) {
            this.clearLevel()

            // 储存关卡等级
            this.level = level

            // 储存地图信息
            DataManager.Instance.mapInfo = this.level.mapInfo
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0

            // 生成地图
            this.generateTileMap()
        }
    }

    nextLevel() {
        DataManager.Instance.levelIndex++
        this.initLevel()
    }

    clearLevel() {
        //消除上一关的所有游戏对象
        this.stage.destroyAllChildren()
        //数据中心重置
        DataManager.Instance.reset()
    }
    generateStage() {
        //创建舞台
        this.stage = createUINode()
        this.stage.setParent(this.node)
    }

    generateTileMap() {
        //创建瓦片地图
        const tileMap = createUINode()
        tileMap.setParent(this.stage)

        const tileManager = tileMap.addComponent(TileMapManager)
        tileManager.init()

        this.adaptPos()
    }

    //自适应调整地图位于屏幕中央
    adaptPos() {
        const { mapColumnCount, mapRowCount } = DataManager.Instance
        const disX = (TILE_WIDTH * mapRowCount) / 2
        const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
        this.stage.setPosition(-disX, disY)
    }
}
