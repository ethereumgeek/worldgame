import React, { Component } from 'react';
import './ArrowControl.css';

class ArrowControl extends Component {
    //constructor(props) {
    //  super(props);

        // This binding is necessary to make `this` work in the callback
    //}

    shorten(x, y, w, h, amount, shortenX, shortenY, shortenW, shortenH) {
      let length = Math.sqrt((w*w) + (h*h));
      let amountW = Math.max(Math.floor((amount * w) / length),0);
      let amountH = Math.max(Math.floor((amount * h) / length),0);
      let xPrime = x + (shortenX ? amountW : 0);
      let yPrime = y + (shortenY ? amountH : 0);

      let factorW = 0;
      let factorH = 0;
      if(shortenX) { factorW++; }
      if(shortenW) { factorW++; }
      if(shortenY) { factorH++; }
      if(shortenH) { factorH++; }

      let wPrime = Math.max(w - amountW*factorW,2);
      let hPrime = Math.max(h - amountH*factorH,2);
      
      return {xPrime, yPrime, wPrime, hPrime};
    }

    render() {

        let isFriendly = this.props.isFriendly;
        let shortenDest = this.props.shortenDest;
        let shortenX = true;
        let shortenY = true;
        let shortenW = true;
        let shortenH = true;

        let x1 = this.props.x1;
        let y1 = this.props.y1-5;
        let x2 = this.props.x2;
        let y2 = this.props.y2-5;

        let normalOrientation = true;
        let x = 0;
        let w = 0;
        if(x2 > x1) {
          x = x1;
          w = Math.max(x2-x1, 2);
          shortenW = shortenDest;
        }
        else {
          x = x2;
          w = Math.max(x1-x2, 2);
          normalOrientation = !normalOrientation;
          shortenX = shortenDest;
        }

        let y = 0;
        let h = 0;
        if(y2 > y1) {
          y = y1;
          h = Math.max(y2-y1, 2);
          shortenH = shortenDest;
        }
        else {
          y = y2;
          h = Math.max(y1-y2, 2);
          normalOrientation = !normalOrientation;
          shortenY = shortenDest;
        }

        let {xPrime, yPrime, wPrime, hPrime} = this.shorten(x, y, w, h, 43, shortenX, shortenY, shortenW, shortenH);

        let arrowClass = "arrowLineA_enemy";
        if(isFriendly) {
          arrowClass = "arrowLineA_friend";
          if(!normalOrientation) {
            arrowClass = "arrowLineB_friend";
          }
        }
        else if(!normalOrientation) {
          arrowClass = "arrowLineB_enemy";
        }

        return (
            <div onClick={this.props.onClick} className={arrowClass} style={{zIndex:8, position:"absolute", top:yPrime, left:xPrime, width:wPrime, height:hPrime}}></div>
        );
    }
  }
  
  export default ArrowControl;