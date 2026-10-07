<script>
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/api/auth';
	import { tick } from 'svelte';

	const PHONE_RE = /^\+?[1-9]\d{10,14}$/;
	const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const EMAIL_DOMAINS = ['mail.ru', 'mail.yahoo.com', 'yandex.ru', 'gmail.com'];

	let name = '';

	let email = '';
	let emailInputEl;

	let password = '';
	let repeatedPassword = '';

	let phone = '';
	let phoneDisplay = '';

	let address = {
		country: '',
		city: '',
		street: ''
	};

	let isSubmitting = false;
	let errorMessage = '';

	function extractDigits(rawValue) {
		let digits = rawValue.replace(/\D/g, '');

		if (digits.startsWith('8')) {
			digits = '7' + digits.slice(1);
		}

		if (digits.length > 0 && !digits.startsWith('7')) {
			digits = '7' + digits;
		}

		return digits.slice(0, 11);
	}

	function formatPhoneDigits(digits) {
		const country = digits.slice(0, 1);
		const area = digits.slice(1, 4);
		const part1 = digits.slice(4, 7);
		const part2 = digits.slice(7, 9);
		const part3 = digits.slice(9, 11);

		if (!country) return '';

		let formatted = `+${country}`;

		if (area) formatted += ` (${area}`;
		if (area.length === 3) formatted += `)`;
		if (part1) formatted += ` ${part1}`;
		if (part2) formatted += `-${part2}`;
		if (part3) formatted += `-${part3}`;

		return formatted;
	}

	async function handlePhoneInput(event) {
		console.log(name);

		const input = event.currentTarget;
		const rawValue = input.value;
		const cursorPos = input.selectionStart ?? rawValue.length;

		const rawDigits = rawValue.replace(/\D/g, '');

		let digitsBeforeCursor = rawValue.slice(0, cursorPos).replace(/\D/g, '').length;

		if (rawDigits.length > 0 && !rawDigits.startsWith('8') && !rawDigits.startsWith('7')) {
			digitsBeforeCursor++;
		}

		const digits = extractDigits(input.value);
		const formatted = formatPhoneDigits(digits);

		phone = digits ? `+${digits}` : '';
		phoneDisplay = formatted;

		input.value = formatted;

		await tick();

		let newPos = formatted.length;
		let seenDigits = 0;

		if (digitsBeforeCursor === 0) {
			newPos = 0;
		} else {
			for (let i = 0; i < formatted.length; i++) {
				if (/\d/.test(formatted[i])) {
					seenDigits++;
				}

				if (seenDigits === digitsBeforeCursor) {
					newPos = i + 1;
					break;
				}
			}
		}

		input.setSelectionRange(newPos, newPos);
	}

	function sanitizeEmailChars(value) {
		// 1. Удаляем все абсолютно запрещенные символы
		let cleaned = value.replace(/[^\w\d.@-]/g, '');

		// 2. Запрещаем символ @ в самом начале строки
		cleaned = cleaned.replace(/^@+/, '');

		// 3. Если @ все еще несколько (например, при массовой вставке текста), оставляем только первый
		let parts = cleaned.split('@');
		if (parts.length > 2) {
			cleaned = parts[0] + '@' + parts.slice(1).join('');
		}

		const atIndex = cleaned.indexOf('@');
		if (atIndex === -1) {
			// TODO: Вернуться к Т9 почты
			cleaned = cleaned.slice(0, 16);
		} else {
			cleaned = cleaned.slice(0, atIndex) + cleaned.slice(atIndex);
		}

		return cleaned;
	}

	function getDomainSuggestion(value) {
		const atIndex = value.indexOf('@');
		if (atIndex === -1) return '';

		const domainPart = value.slice(atIndex + 1);
		if (!domainPart) return '';

		const lower = domainPart.toLowerCase();
		const match = EMAIL_DOMAINS.find((d) => d !== lower && d.startsWith(lower));

		return match ? match.slice(domainPart.length) : '';
	}

	$: emailSuggestion = getDomainSuggestion(email);

	function handleEmailInput(event) {
		const input = event.currentTarget;
		let rawValue = input.value;

		// 1. Запоминаем позицию курсора до изменений
		let startPos = input.selectionStart;

		// ТОЧЕЧНАЯ БЛОКИРОВКА: Если @ уже есть, перехватываем ввод нового @ прямо под курсором
		if (email.includes('@') && (rawValue.match(/@/g) || []).length > 1) {
			if (startPos > 0 && rawValue[startPos - 1] === '@') {
				// Вырезаем именно тот @, который пользователь только что ввел
				rawValue = rawValue.slice(0, startPos - 1) + rawValue.slice(startPos);
				// Корректируем позицию курсора, так как введенный символ отклонен
				startPos--;
			}
		}

		// 2. Вырезаем часть строки ДО курсора и очищаем её
		const leftPartRaw = rawValue.slice(0, startPos);
		const leftPartSanitized = sanitizeEmailChars(leftPartRaw);

		// 3. Считаем, сколько символов было удалено конкретно слева от курсора
		const removedCharsCount = leftPartRaw.length - leftPartSanitized.length;

		// 4. Очищаем всю строку целиком
		const sanitized = sanitizeEmailChars(rawValue);

		// 5. Синхронизируем состояние Svelte и DOM
		email = sanitized;
		input.value = sanitized;

		// 6. Корректируем позицию курсора с учетом удаленных символов
		const newPos = Math.max(0, startPos - removedCharsCount);
		input.setSelectionRange(newPos, newPos);
	}

	async function handleEmailKeydown(event) {
		if (!emailSuggestion) return;
		if (event.key !== 'Tab' && event.key !== 'ArrowRight') return;

		const input = event.currentTarget;
		const atEnd = input.selectionStart === email.length && input.selectionEnd === email.length;

		if (!atEnd) return;

		event.preventDefault();

		email = email + emailSuggestion;

		await tick();
		input.setSelectionRange(email.length, email.length);
	}

	async function handleSubmit() {
		errorMessage = '';
		isSubmitting = true;

		console.log(email);

		try {
			await signUp({
				name,
				email: email,
				...(phone ? { phone } : {}),
				password,
				address
			});
			goto('/');
		} catch (e) {
			console.log(e);
			errorMessage = e.details ? e.details[0] : e.message ? e.message : 'Failed to register';
		} finally {
			isSubmitting = false;
		}
	}

	$: isFormValid = !(
		!name ||
		!email ||
		!EMAIL_RE.test(email) ||
		!address.country ||
		!address.city ||
		password.length < 6 ||
		!repeatedPassword ||
		password !== repeatedPassword ||
		(phone && !PHONE_RE.test(phone))
	);

</script>

<svelte:head>
	<title>Sign up</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen w-full">
	<form
		on:submit|preventDefault={handleSubmit}
		class="w-sm mx-auto mx p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
	>
		<h1 class="text-xl font-semibold text-gray-900 mb-6 text-center">Sign up</h1>

		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Name (required)</span>
				<input
					type="text"
					bind:value={name}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4 relative">
			<label class="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">E-mail (required)</span>

				<div class="relative">
					<div
						aria-hidden="true"
						class="absolute inset-0 flex items-center whitespace-pre rounded-md border border-black px-3 py-2 text-sm pointer-events-none"
					>
						<span class="invisible">{email}</span><span class="text-gray-400"
							>{emailSuggestion}</span
						>
					</div>
					<input
						bind:this={emailInputEl}
						type="text"
						on:input={handleEmailInput}
						on:keydown={handleEmailKeydown}
						bind:value={email}
						autocomplete="off"
						autocapitalize="off"
						spellcheck="false"
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</div>
			</label>
			<!-- <div
				class={`${isDomainsDiv ? 'absolute' : 'hidden'} right-0 border border-gray-300 bg-white rounded-lg p-1 text-sm text-gray-500`}
			>
				{#each EMAIL_DOMAINS as domain (domain)}
					<div
						class="px-2 py-1 rounded-md hover:bg-gray-200 cursor-pointer duration-200"
						role="button"
						tabindex="0"
						on:keydown={() => {}}
						on:click={() => handleDomainSelect(domain)}
					>
						@{domain}
					</div>
				{/each}
			</div> -->
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Phone (optional)</span>
				<input
					type="tel"
					inputmode="numeric"
					placeholder="+7 (999) 999-99-99"
					on:input={handlePhoneInput}
					bind:value={phoneDisplay}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>

			<!-- {phone} -->
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Country (required)</span>
				<input
					type="text"
					bind:value={address.country}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">City (required)</span>
				<input
					type="text"
					bind:value={address.city}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block mb-4">
				<span class="block text-sm text-gray-500 mb-1">Street (optional)</span>
				<input
					type="text"
					bind:value={address.street}
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		<div class="mb-4">
			<label for="block">
				<span class="block text-sm text-gray-500 mb-1">Password (required)</span>
				<input
					type="password"
					bind:value={password}
					required
					minlength="6"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>
		<div class="mb-4">
			<label for="block">
				<span class="block text-sm text-gray-500 mb-1">Repeat password (required)</span>
				<input
					type="password"
					bind:value={repeatedPassword}
					required
					minlength="6"
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
			</label>
		</div>

		{#if errorMessage}
			<p class="text-sm text-red-500 mb-4">{errorMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={isSubmitting || !isFormValid}
			class="w-full mt-12 rounded-md bg-blue-500 text-white font-medium py-2.5 hover:bg-blue-500/75 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-colors cursor-pointer"
		>
			{isSubmitting ? 'Singin up...' : 'Sign up'}
		</button>

		<!-- <p class="text-sm text-gray-600 text-center mt-6">
			Нет аккаунта? <a href="/signup" class="text-blue-500 hover:underline">Создать</a>
		</p> -->
	</form>
</div>
