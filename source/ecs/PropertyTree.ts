/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Entity, Component, Property, PropertySet } from "@ff/core/ecs";

import SelectionController, {
    ISelectComponentEvent,
    ISelectEntityEvent
} from "@ff/core/ecs/SelectionController";

import Tree from "../Tree";
import "../PropertyView";
import { customElement, html } from "../CustomElement";

////////////////////////////////////////////////////////////////////////////////

type EC = Entity | Component;

interface ITreeNode
{
    id: string;
    children: ITreeNode[];
    text: string;
    classes: string;
    property?: Property;
}

@customElement("ff-property-tree")
export default class PropertyTree extends Tree<ITreeNode>
{
    protected controller: SelectionController;

    constructor(controller: SelectionController)
    {
        super();
        this.controller = controller;
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-property-tree");
    }

    protected connected()
    {
        super.connected();

        this.controller.on("entity", this.onSelectEntity, this);
        this.controller.on("component", this.onSelectComponent, this);
    }

    protected disconnected()
    {
        super.disconnected();

        this.controller.off("entity", this.onSelectEntity, this);
        this.controller.off("component", this.onSelectComponent, this);
    }

    protected getClasses(node: ITreeNode)
    {
        return node.classes;
    }

    protected renderNodeHeader(node: ITreeNode)
    {
        return html`
            <div class="ff-text">${node.text}</div>
            ${node.property ? html`<ff-property-view .property=${node.property}></ff-property-view>` : null}
        `;
    }

    protected onSelectEntity(event: ISelectEntityEvent)
    {
        if (event.selected) {
            this.root = this.createEntityNode(event.entity);
        }
    }

    protected onSelectComponent(event: ISelectComponentEvent)
    {
        if (event.selected) {
            this.root = this.createComponentNode(event.component);
        }
    }

    protected createEntityNode(entity: Entity): ITreeNode
    {
        return {
            id: entity.id,
            text: entity.name || "Entity",
            classes: "ff-entity",
            children: entity.components.getArray().map(component => this.createComponentNode(component))
        };
    }

    protected createComponentNode(component: Component): ITreeNode
    {
        const id = component.id;
        const inputsId = id + "i";
        const outputsId = id + "o";

        return {
            id,
            text: component.name || component.type,
            classes: "ff-component",
            property: null,
            children: [
                this.createSetNode(inputsId, "Inputs", component.ins),
                this.createSetNode(outputsId, "Outputs", component.outs)
            ]
        };
    }

    protected createSetNode(id: string, text: string, set: PropertySet): ITreeNode
    {
        const properties = set.properties;
        const root: ITreeNode = {
            id,
            text,
            classes: "ff-set",
            children: []
        };

        properties.forEach(property => {
            const fragments = property.path.split(".");
            let node = root;

            const count = fragments.length;
            const last = count - 1;

            for (let i = 0; i < count; ++i) {
                const fragment = fragments[i];
                let child = node.children.find(node => node.text === fragment);

                if (!child) {
                    const id = i === last ? property.key : fragment;

                    child = {
                        id,
                        text: fragment,
                        classes: "",
                        children: [],
                        property: i === last ? property : null
                    };
                    node.children.push(child);
                }
                node = child;
            }
        });

        return root;
    }
}
