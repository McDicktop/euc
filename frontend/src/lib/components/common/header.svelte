<script>
	import UserIcon from './userIcon.svelte';

    const backendUrl = "http://localhost:3000";
  const avatarKey = "avatar.webp";
</script>

<header class="sticky top-0 z-[100] select-none bg-lime-500/40">
	<div class="flex items-center justify-between">
		<p class="font-semibold text-xl p-2 text-gray-700">NativeWheels</p>
		<div class="p-2">
            <UserIcon />
        </div>

        <div class="border border-black size-10">
              <img  src="{backendUrl}/{avatarKey}" alt="Avatar" width="100px" height="100px"/>
        </div>
      
	</div>
</header>
