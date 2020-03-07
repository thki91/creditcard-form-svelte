<link href="https://fonts.googleapis.com/css?family=Share+Tech+Mono&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Hind&display=swap" rel="stylesheet">

<script>
	import Creditcard from './Creditcard.svelte';
	import CreditcardForm from './CreditcardForm.svelte';
	import Modal from './Modal.svelte';

	let showModal = false;
	let initialCreditcardData = {
		owner: '',
		number: '',
		cvv: '',
		validUntilMonth: '',
		validUntilYear: '',
		isBack: false
	}
	let creditcardData = {...initialCreditcardData};

	function handleSubmit() {
		showModal = true;
  }

	function toggleCreditcardHandler () {
		creditcardData.isBack = !creditcardData.isBack;
	}

	function handleCloseModal() {
		showModal = false;
		creditcardData = initialCreditcardData;
	}
</script>

<style type="text/scss">
  $white: #FFF;

  .wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.container {
		max-width: 450px;
		background-color: $white;
		box-shadow: 0px 1px 11px 1px #ddd;
		border-radius: 4px;
		padding: 20px;
	}
</style>

<div class="wrapper">

	<div class="container">
		<Creditcard
			{...creditcardData} />
		<CreditcardForm
			bind:prop="{creditcardData}"
			{handleSubmit}
			{toggleCreditcardHandler} />
	</div>
</div>
<Modal
	{...creditcardData}
	{showModal}
	{handleCloseModal} />
