import { game, RenderRoot2D } from 'cc'
import Singleton from '../Base/Singleton'
import { DEFAULT_FADE_DURATION, DrawManager } from '../Script/UI/DrawManager'
import { createUINode } from '../Util'

export default class FaderManager extends Singleton {
    static get Instance() {
        return super.GetInstace<FaderManager>()
    }

    private _fader: DrawManager = null

    get fader() {
        if (this._fader !== null) {
            return this._fader
        }
        //UI节点要渲染在屏幕上的话，必须使用Canvas组件或者RenderRoot2D组件
        const root = createUINode()
        root.addComponent(RenderRoot2D)

        const faderNode = createUINode()
        faderNode.setParent(root)
        this._fader = faderNode.addComponent(DrawManager)
        this._fader.init()
        //使用常驻组件，在场景切换时不销毁
        game.addPersistRootNode(root)
        return this._fader
    }

    async fadeIn(duration: number = DEFAULT_FADE_DURATION) {
        return await this.fader.fadeIn(duration)
    }

    async fadeOut(duration: number = DEFAULT_FADE_DURATION) {
        return await this.fader.fadeOut(duration)
    }

    async mask() {
        await this.fader.mask()
    }
}
