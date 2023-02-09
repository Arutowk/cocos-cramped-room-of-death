import { _decorator, Component, Node } from 'cc'
import { createUINode } from '../../Util'
const { ccclass } = _decorator

import { TileMapManager } from '../Tile/TileMapManager'

@ccclass('BattleManager')
export class BattleManager extends Component {
    start() {
        this.generateTileMap()
    }

    generateTileMap() {
        //创建舞台
        const stage = createUINode()
        stage.setParent(this.node)
        //创建瓦片地图
        const tileMap = createUINode()
        tileMap.setParent(stage)

        const tileManager = tileMap.addComponent(TileMapManager)
        tileManager.init()
    }


}
