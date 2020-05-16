
post_install() {
	systemctl enable {{name}}
	systemctl enable {{name}}.socket
	systemctl start {{name}}
	systemctl start {{name}}.socket
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}

post_upgrade() {
	systemctl restart {{name}}
	systemctl restart {{name}}.socket
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}

pre_remove() {
	systemctl stop {{name}}.socket
	systemctl stop {{name}}
	systemctl disable {{name}}.socket
	systemctl disable {{name}}
}

post_remove() {
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}
