import { resources, SpriteFrame } from 'cc'
import Singleton from '../Base/Singleton'

export default class ResourceManager extends Singleton {
    static get Instance() {
        return super.GetInstace<ResourceManager>()
    }
    loadDir(path: string, type: typeof SpriteFrame = SpriteFrame) {
        return new Promise<SpriteFrame[]>((resolve, reject) => {
            // 加载 目标 目录下所有 SpriteFrame，并且获取它们的路径
            resources.loadDir(path, type, function (err, assets) {
                if (err) {
                    reject(err)
                    return
                }
                resolve(assets)
            })
        })
    }
}
