<style type="text/scss">
  $blue: #2274A5;
  $brown: #816C61;

  .creditcard-form {
    &__group {
      margin-top: 10px;
      &:focus-within {
        .creditcard-form {
          &__input {
            border: 1px solid rgba(19, 27, 35, 0.4);
          }
          &__label {
            color: $brown;
          }
        }
      }
    }

    &__row {
      display: grid;
      grid-template-columns: 1fr 1fr 2fr;
      grid-gap: 10px;
    }

    &__input {
      width: 100%;
      border-radius: 4px;
      border: 1px solid rgba(19, 27, 35, 0.2);
      transition: border 0.5s ease-in;
      outline: none;
    }

    &__select {
      width: 100%;
      border-radius: 4px;
      border: 1px solid rgba(19, 27, 35, 0.2);
      transition: border 0.5s ease-in;
      outline: none;
      background-color: transparent;
      height: 44px;
    }

    &__info {
      background-color: rgba(231, 223, 198, 0.7);
      padding: 10px;
      border-radius: 4px;
      color: $brown;
    }

    &__label {
      margin-top: 10px;
      font-size: 12px;
    }

    &__submit {
      margin-top: 20px;
      width: 100%;
      background: $blue;
      color: white;
      opacity: 0.9;
      border-radius: 4px;
      border: none;
      transition: background-color 0.4s ease-in;

      &:hover {
        background: darken($blue, 8);
      }
    }
  }
</style>

<script>
  export let prop;
  export let handleSubmit;
  export let toggleCreditcardHandler;
  const currMonth = new Date().getMonth();
  const currYear = parseInt(new Date().getFullYear().toString().slice(2));
  let years = [currYear];
  let months = [];
  for (let i = 1; i < 9; i++) {
    years.push(currYear + i);
  }
  // parse back to string since month is also a string
  years = years.map(year => year.toString());

  function setMonths(inFuture) {
    months = []
    for (let i = 0; i < 12; i++) {
      if (i > currMonth || inFuture) {
        const m = i + 1;
        months.push(m < 10 ? `0${m}` : m);
      }
    }
  }

  setMonths();

  function handleYearChange(event) {
    if (parseInt(event.target.value) !== currYear) {
      setMonths(true);
    } else {
      setMonths();
    }
  }

  function handleNumberInput(event) {
    event.target.value = event.target.value.replace(/(\d{4})(\d+)/g, '$1 $2');
  }

  function validateNumber() {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        event.preventDefault();
    } else {
      return true;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="creditcard-form">
    <p class="creditcard-form__info">
      Please enter your credit card data
    </p>
    <div class="creditcard-form__group">
      <label for="cc-number" class="creditcard-form__label">Card Number</label>
      <input type="text" name="cc-number" class="creditcard-form__input" required maxlength="19"
        bind:value="{prop.number}"
        on:keypress={validateNumber}
        on:keyup={handleNumberInput}>
    </div>

    <div class="creditcard-form__group">
      <label for="cc-owner" class="creditcard-form__label">Owner</label>
      <input type="text" bind:value="{prop.owner}" name="cc-owner" class="creditcard-form__input" required>
    </div>

    <div class="creditcard-form__row">
      <div class="creditcard-form__group">
        <label for="cc-valid-until-month" class="creditcard-form__label">Exp. Month</label>
        <select id="cc-valid-until-month" class="creditcard-form__select" bind:value="{prop.validUntilMonth}">
          <option value="" selected disabled hidden>-</option>
          {#each months as month}
            {#if month == prop.validUntilMonth}
              <option value="{month}" selected>{month}</option>
            {:else}
              <option value="{month}" >{month}</option>
            {/if}
          {/each}
        </select>
      </div>
      <div class="creditcard-form__group">
        <label for="cc-valid-until-year" class="creditcard-form__label">Exp. Year</label>
        <select id="cc-valid-until-year" class="creditcard-form__select"
          bind:value="{prop.validUntilYear}"
          on:change={handleYearChange}>
          <option value="" selected disabled hidden>-</option>
          {#each years as year}
            <option value="{year}">{year}</option>
          {/each}
        </select>
      </div>
      <div class="creditcard-form__group">
        <label for="cc-cvv" class="creditcard-form__label">CVV</label>
        <input type="text" name="cc-cvv" class="creditcard-form__input" required maxlength="4" minlength="3"
          bind:value="{prop.cvv}"
          on:focus={toggleCreditcardHandler}
          on:keypress={validateNumber}
          on:blur={toggleCreditcardHandler}>
      </div>
    </div>
    <button type="submit" class="creditcard-form__submit">Submit</button>
  </div>
</form>
