import { _decorator, Component, director, resources, ProgressBar } from 'cc'
import { SCENE_ENUM } from '../../Enum'
const { ccclass, property } = _decorator

@ccclass('LoadingManager')
export class LoadingManager extends Component {
    @property(ProgressBar)
    bar: ProgressBar = null

    onLoad() {
        this.preLoad()
    }

    preLoad() {
        resources.preloadDir(
            'texture',
            (cur, total) => {
                this.bar.progress = cur / total
            },
            async err => {
                if (err) {
                    await new Promise(rs => {
                        setTimeout(rs, 2000)
                    })
                    this.preLoad()
                    return
                }
                director.loadScene(SCENE_ENUM.Start)
            },
        )
    }
}
