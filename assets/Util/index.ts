import { Layers, Node, UITransform } from 'cc'

export const createUINode = (name: string = '') => {
    //每张瓦片创造一个节点
    const node = new Node(name)
    const transform = node.addComponent(UITransform)
    transform.setAnchorPoint(0, 1)
    //想要被cocos渲染的话，必须设置好layer，直接创建的空节点不具备这个属性
    //位置：项目->项目设置->Layers ,查看index
    //这里是直接调用自带nameToLayer方法
    node.layer = 1 << Layers.nameToLayer('UI_2D')
    return node
}

export const randomByRange = (start: number, end: number) => Math.floor(start + (end - start) * Math.random())
