<style type="text/scss">
  $brown: #816C61;

  .chip {
    background-image:linear-gradient(to bottom right, #EEE8AA , #BDB76B);
    width: 50px;
    height: 40px;
    border-radius: 8px;
    margin-bottom: 10px;
    position: relative;
    box-shadow: 0px 6px 12px 2px rgba(0,0,0, 0.1);

    &__left {
      &:before {
        content: '';
        position: absolute;
        left: 0px;
        width: 14px;
        height: 10px;
        top: 9px;
        border: 1px solid $brown;
        border-left: none;
        border-top-right-radius: 4px;
      }

      &:after {
        content: '';
        position: absolute;
        left: 0px;
        width: 14px;
        height: 10px;
        top: 21px;
        border: 1px solid $brown;
        border-left: none;
        border-top: none;
        border-bottom-right-radius: 4px;
      }
    }

    &__right {
      &:before {
        content: '';
        position: absolute;
        right: 0px;
        width: 14px;
        height: 10px;
        top: 9px;
        border: 1px solid $brown;
        border-right: none;
        border-top-left-radius: 4px;
      }

      &:after {
        content: '';
        position: absolute;
        right: 0px;
        width: 14px;
        height: 10px;
        top: 21px;
        border: 1px solid $brown;
        border-right: none;
        border-top: none;
        border-bottom-left-radius: 4px;
      }
    }

    &__middle {
      position: absolute;
      right: 15px;
      top: 14px;
      width: 21px;
      height: 12px;
      border: 1px solid $brown;
      border-left: none;
      border-right: none;
    }
  }
</style>

<div class="chip">
    <div class="chip__left"></div>
    <div class="chip__middle"></div>
    <div class="chip__right"></div>
</div>
