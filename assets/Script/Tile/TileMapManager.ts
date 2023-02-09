import { _decorator, Component } from 'cc'
const { ccclass } = _decorator

import DataManager from '../../Runtime/Datamanager'
import ResourceManager from '../../Runtime/ResourceManager'
import { createUINode } from '../../Util'
import { TileManager } from './TileManager'

@ccclass('TileMapManager')
export class TileMapManager extends Component {
    async init() {
        const SpriteFrames = await ResourceManager.Instance.loadDir('texture/tile/tile')
        const { mapInfo } = DataManager.Instance
        for (let i = 0; i < mapInfo.length; i++) {
            const column = mapInfo[i]
            for (let j = 0; j < column.length; j++) {
                const item = column[j]
                if (item.src === null || item.type === null) {
                    continue
                }

                const node = createUINode()
                //获得路径
                const ImgSrc = `tile (${item.src})`
                const spriteFrame = SpriteFrames.find(v => v.name === ImgSrc) || SpriteFrames[0]
                const tileManager = node.addComponent(TileManager)
                tileManager.init(spriteFrame, i, j)

                node.setParent(this.node)
            }
        }
    }
}
