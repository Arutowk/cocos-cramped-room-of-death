import { _decorator, Component, Node } from 'cc'
import levels, { ILevel } from '../../Level'
import { DataManagerInstance } from '../../Runtime/Datamanager'
import { createUINode } from '../../Util'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
const { ccclass } = _decorator

import { TileMapManager } from '../Tile/TileMapManager'

@ccclass('BattleManager')
export class BattleManager extends Component {
    level: ILevel
    stage: Node

    start() {
        this.generateStage()
        this.initLevel()
    }

    initLevel() {
        const level = levels[`level${1}`]
        if (level) {
            // 储存关卡等级
            this.level = level
            // 储存地图信息
            DataManagerInstance.mapInfo = this.level.mapInfo
            DataManagerInstance.mapRowCount = this.level.mapInfo.length || 0
            DataManagerInstance.mapColumnCount = this.level.mapInfo[0].length || 0
            // 生成地图
            this.generateTileMap()
        }
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
        const { mapColumnCount, mapRowCount } = DataManagerInstance
        const disX = (TILE_WIDTH * mapRowCount) / 2
        const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
        this.stage.setPosition(-disX, disY)
    }
}
