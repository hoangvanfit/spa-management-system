# Sử dụng PHP 8.2 với Apache
FROM php:8.2-apache

# Cài đặt system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    default-mysql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Cài đặt PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www/html

# Cài đặt dependencies
RUN composer install --no-dev --optimize-autoloader

# Tạo thư mục cần thiết
RUN mkdir -p /var/www/html/public/storage

# Set permissions trước
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Tạo storage link (có thể fail nên ignore error)
RUN php artisan storage:link || true

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy Apache configuration
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]