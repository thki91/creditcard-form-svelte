
<style type="text/scss">
  $white: #FFF;
  $creditcard-font: 'Share Tech Mono';
  $creme: rgba(231, 223, 198, 1);

  .creditcard {
    position: relative;
    z-index: 1;
    height: 190px;

    &--hidden {
      display: none;
    }

    &--back {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    &__wrapper {
      max-width: 350px;
      margin: 0px auto;
      box-shadow: 5px 6px 12px 2px #bbb;
      background-color: #2274A5;
      border-radius: 4px;
      padding: 20px;
      position: relative;
      top: -40px;

      &:before {
        content: '';
        display: block;
        background-color: #131B23;
        opacity: 0.2;
        width: 100px;
        height: 100px;
        position: absolute;
        top: 40px;
        left: 50px;
        border-radius: 4px;
      }

      &:after {
        content: '';
        display: block;
        background-color: #816C61;
        opacity: 0.3;
        z-index: 0;
        width: 190px;
        height: 100px;
        position: absolute;
        top: 70px;
        right: 40px;
        border-radius: 4px;
      }
    }

    &__chip {
      width: 50px;
    }

    &__type {
      display: flex;
      justify-content: flex-end;
      color: $white;
    }

    &__number {
      font-family: $creditcard-font;
      color: $white;
      font-size: 24px;
      min-height: 27px;
    }

    &__valid-until {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10px;
    }

    &__valid-until-number {
      min-width: 30px;
    }

    &__valid-until-text {
      text-transform: uppercase;
      font-size: 7px;
      line-height: 9px;
      max-width: 35px;
      color: $white;
    }

    &__valid-until-date {
      font-size: 18px;
      color: $white;
      display: grid;
      grid-template-columns: 20px 20px 20px;

      div {
        text-align: center;
      }
    }

    &__owner {
      margin-top: 10px;
      font-family: $creditcard-font;
      font-size: 16px;
      color: $white;
      min-height: 18px;
    }

    &__cvv {
      background-color: $creme;
      color: black;
      font-family: $creditcard-font;
      min-width: 80%;
      padding: 5px 15px;
      border-radius: 4px;
      height: auto;
      display: flex;
      justify-content: flex-end;
      min-height: 30px;
      align-items: center;
      align-self: flex-end;
    }

    &__cvv-text {
      color: $white;
      font-size: 10px;
      text-transform: uppercase;
      align-self: flex-end;
      margin-bottom: 5px;
      margin-right: 2px;
    }
  }

  .fade-in {
    opacity: 1;
    animation-name: fadeInOpacity;
    animation-iteration-count: 1;
    animation-timing-function: ease-in;
    animation-duration: 0.3s;
  }

  @keyframes fadeInOpacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>

<script>
  import Visa from './Visa.svelte';
  import Chip from './Chip.svelte';
  export let number;
  export let owner;
  export let validUntilMonth;
  export let validUntilYear;
  export let cvv;
  export let isBack;
</script>

<div class="creditcard__wrapper">
  <div class="creditcard {isBack ? 'creditcard--hidden' : 'creditcard--front fade-in'}">
    <div class="creditcard__type"><Visa/></div>
    <Chip/>
    <div class="creditcard__number">
      {number || 'xxxx xxxx xxxx xxxx'}
    </div>
    <div class="creditcard__valid-until">
      <div class="creditcard__valid-until-text">
        Valid Until
      </div>
      <div class="creditcard__valid-until-date">
        <div>{validUntilMonth}</div>
        <div>/</div>
        <div>{validUntilYear}</div>
      </div>
    </div>
    <div class="creditcard__owner">
      {owner || 'Your Name'}
    </div>
  </div>
  <div class="creditcard {isBack ? 'creditcard--back fade-in' : 'creditcard--hidden'}">
    <div class="creditcard__cvv-text">CCV Code</div>
    <div class="creditcard__cvv">
      {cvv}
    </div>
  </div>
</div>
