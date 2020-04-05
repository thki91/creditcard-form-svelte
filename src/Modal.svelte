<style type="text/scss">
  $blue: #2274A5;

  .modal {
    position: fixed;
    z-index: 1;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
    transition: opacity 0.3s ease-out;

    &--visible {
      display: block;
      opacity: 1;
    }

    &--hidden {
      display: none;
      opacity: 0;
    }

    &__content {
      background-color: #fefefe;
      margin: auto;
      padding: 25px;
      box-shadow: 0px 6px 12px 2px rgba(0,0,0, 0.1);
      border-radius: 4px;
      width: 60%;
      max-width: 450px;
    }

    &__title {
      color: $blue;
      margin-top: 0px;
    }

    &__paragraph {
      margin: 5px;
    }

    &__close {
      color: rgba(0,0,0, 0.4);
      float: right;
      font-size: 28px;
      line-height: 28px;
      font-weight: bold;
      transition: color 0.2s ease-in;

      &:hover {
        cursor: pointer;
        color: rgba(0,0,0, 0.7);
      }
    }
  }
</style>

<script>
  export let number;
  export let owner;
  export let validUntilMonth;
  export let validUntilYear;
  export let cvv;
  export let showModal;
  export let handleCloseModal;
</script>

<div class="modal {showModal ? 'modal--visible' : 'modal--hidden'}">
  <div class="modal__content">
    <span class="modal__close" on:click={handleCloseModal}>&times;</span>
    <h3 class="modal__title">The following data was submitted</h3>
    <p class="modal__paragraph">Number: {number}</p>
    <p class="modal__paragraph">Owner: {owner}</p>
    <p class="modal__paragraph">
      Valid Until: {validUntilMonth}/{validUntilYear}
    </p>
    <p class="modal__paragraph">CVV: {cvv}</p>
  </div>
</div>
