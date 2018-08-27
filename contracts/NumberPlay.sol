pragma solidity ^0.4.0;
import "openzeppelin-solidity/contracts/math/Math.sol";

contract NumberPlay {

    /* Current value. */
    uint256 public currentVal;

    event Bigger(uint256 value);
    event Smaller(uint256 value);

    /* Constructor. */
    constructor() public {
    }

    /* Fallback function. Added so ether sent to this contract is reverted. */
    function() public payable {
        revert("Invalid call to contract.");
    }

    function maximum(uint256 newVal) public {
        currentVal = Math.max(currentVal, newVal);
        emit Bigger(currentVal);
    }

    function minimum(uint256 newVal) public {
        currentVal = Math.min(currentVal, newVal);
        emit Smaller(currentVal);
    }
}
