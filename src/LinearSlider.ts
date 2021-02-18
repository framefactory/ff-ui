/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";

import CustomElement, { property, PropertyValues, customElement, html } from "./CustomElement";
import DragHelper, { IDragTarget } from "./DragHelper";

////////////////////////////////////////////////////////////////////////////////

export type SliderDirection = "horizontal" | "vertical";

export interface ILinearSliderChangeEvent extends CustomEvent
{
    type: "change";
    target: LinearSlider;
    detail: {
        value: number;
        isDragging: boolean;
    }
}

@customElement("ff-linear-slider")
export default class LinearSlider extends CustomElement implements IDragTarget
{
    @property({ type: String })
    direction: SliderDirection = "horizontal";

    @property({ type: Number })
    value = 0;

    private _isVertical = false;
    private _knob: CustomElement;

    private _offsetX = 0;
    private _offsetY = 0;

    constructor()
    {
        super();

        this._knob = new CustomElement()
            .addClass("ff-knob")
            .setStyle({ position: "absolute" });

        // observe size changes, note that ResizeObserver is not defined in TS yet
        const ResizeObserver = (window as any).ResizeObserver;
        if (ResizeObserver) {
            new ResizeObserver(() => this.requestUpdate("value")).observe(this);
        }

        new DragHelper(this);
    }

    dragStart(event: PointerEvent)
    {
        const knob = this._knob;
        const track = this.getBoundingClientRect();

        if (event.target === this._knob) {
            this._offsetX = event.clientX - knob.offsetLeft + (knob.clientWidth - knob.offsetWidth) * 0.5;
            this._offsetY = event.clientY - knob.offsetTop + (knob.clientHeight - knob.offsetHeight) * 0.5;
        }
        else {
            this._offsetX = track.left + knob.clientWidth * 0.8;
            this._offsetY = track.top + knob.clientHeight * 0.8;
        }

        this.dragMove(event);
    }

    dragMove(event: PointerEvent)
    {
        const knob = this._knob;
        const px = event.clientX - this._offsetX;
        const py = event.clientY - this._offsetY;

        let v = this._isVertical
            ? 1 - py / (this.clientHeight - knob.clientHeight)
            : px / (this.clientWidth - knob.clientWidth);

        v = math.limit(v, 0, 1);

        if (v !== this.value) {
            this.value = v;
            this.emitChangeEvent(true);
        }
    }

    dragEnd()
    {
        this.emitChangeEvent(false);
    }

    protected firstConnected()
    {
        this.setStyle({
            position: "relative",
            touchAction: "none"
        });

        this.setAttribute("touch-action", "none");
        this.setAttribute("tabindex", "0");

        this.classList.add("ff-control", "ff-linear-slider");

        this.appendChild(this._knob);
    }

    protected update(changedProperties: PropertyValues): void
    {
        if (changedProperties.has("direction")) {
            this._isVertical = this.direction === "vertical";
            this.setClass("ff-horizontal", !this._isVertical);
            this.setClass("ff-vertical", this._isVertical);
        }

        if (changedProperties.has("value")) {
            const value = math.limit(this.value, 0, 1);
            const knob = this._knob;

            if (this._isVertical) {
                const height = this.clientHeight - knob.clientHeight;
                knob.style.top = `${((1 - value) * height).toFixed(1)}px`;
            }
            else {
                const width = this.clientWidth - knob.clientWidth;
                knob.style.left = `${(value * width).toFixed(1)}px`;
            }
        }

        super.update(changedProperties);
    }

    protected emitChangeEvent(isDragging: boolean)
    {
        this.dispatchEvent(new CustomEvent("change", {
            detail: {
                value: this.value,
                isDragging
            },
            bubbles: true
        }));
    }
}