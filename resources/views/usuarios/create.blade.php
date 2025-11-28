<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Registrar Usuario</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style> body { font-family: 'Inter', sans-serif; } </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-6">

    <div class="max-w-md w-full bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        
        <div class="bg-indigo-600 p-6 text-center">
            <h2 class="text-2xl font-bold text-white">Nuevo Usuario 👤</h2>
            <p class="text-indigo-200 text-sm mt-1">Da de alta a un miembro del equipo</p>
        </div>

        <div class="p-8">
            <!-- Errores -->
            @if($errors->any())
                <div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
                    {{ $errors->first() }}
                </div>
            @endif

            <form action="{{ route('usuarios.store') }}" method="POST" class="space-y-5">
                @csrf

                <!-- Nombre -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="nombre" required placeholder="Ej: Juan Pérez"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" required placeholder="ejemplo@empresa.com"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                </div>

                <!-- Contraseña -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input type="password" name="password" required placeholder="******"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition">
                </div>

                <!-- Rol -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rol del Usuario</label>
                    <select name="rol" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                        <option value="vendedor">Vendedor (Vender Autos)</option>
                        <option value="consultor">Consultor (Ver Reportes)</option>
                        <option value="administrador">Administrador (Control Total)</option>
                    </select>
                </div>

                <!-- Botones -->
                <div class="flex gap-3 pt-4">
                    <a href="/dashboard" class="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200 transition font-medium">
                        Cancelar
                    </a>
                    <button type="submit" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-bold shadow-md">
                        Registrar
                    </button>
                </div>
            </form>
        </div>
    </div>

</body>
</html>