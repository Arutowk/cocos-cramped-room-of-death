import { _decorator, Component, Node, Sprite, resources, SpriteFrame, UITransform, Layers } from 'cc'
const { ccclass } = _decorator

import levels from '../../Level'
import { createUINode } from '../../Util'
import { TileManager } from './TileManager'

export const TILE_WIDTH = 55
export const TILE_HEIGHT = 55

@ccclass('TileMapManager')
export class TileMapManager extends Component {
    async init() {
        const { mapInfo } = levels[`level${1}`]
        const SpriteFrames = await this.loadRes()
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

    loadRes() {
        return new Promise<SpriteFrame[]>((resolve, reject) => {
            // 加载 目标 目录下所有 SpriteFrame，并且获取它们的路径
            resources.loadDir('texture/tile/tile', SpriteFrame, function (err, assets) {
                if (err) {
                    reject(err)
                    return
                }
                resolve(assets)
            })
        })
    }
}
