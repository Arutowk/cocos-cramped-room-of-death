import { _decorator, Component } from 'cc'
import DataManager from '@assets/Runtime/Datamanager'
import ResourceManager from '@assets/Runtime/ResourceManager'
import { createUINode, randomByRange } from '@assets/Util'
import { TileManager } from './TileManager'

const { ccclass } = _decorator

@ccclass('TileMapManager')
export class TileMapManager extends Component {
    async init() {
        const SpriteFrames = await ResourceManager.Instance.loadDir('texture/tile/tile')
        const { mapInfo } = DataManager.Instance
        DataManager.Instance.tileInfo = []
        for (let i = 0; i < mapInfo.length; i++) {
            const column = mapInfo[i]
            for (let j = 0; j < column.length; j++) {
                const item = column[j]
                if (item.src === null || item.type === null) {
                    continue
                }
                let number = item.src
                if ((number === 1 || number === 5 || number === 9) && i % 2 === 0 && j % 2 === 0) {
                    number += randomByRange(0, 4)
                }

                const node = createUINode()
                //获得路径
                const ImgSrc = `tile (${number})`
                const spriteFrame = SpriteFrames.find(v => v.name === ImgSrc) || SpriteFrames[0]
                const tileManager = node.addComponent(TileManager)
                const type = item.type
                tileManager.init(type, spriteFrame, i, j)
                DataManager.Instance.tileInfo[i][j] = tileManager

                node.setParent(this.node)
            }
        }
    }
}
