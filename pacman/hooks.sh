
post_install() {
	systemctl daemon-reload
	systemctl enable {{name}}
	systemctl enable {{name}}.socket
	systemctl start {{name}}
	systemctl start {{name}}.socket
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}

post_upgrade() {
	systemctl daemon-reload
	systemctl restart {{name}}
}

pre_remove() {
	systemctl stop {{name}}.socket
	systemctl stop {{name}}
	systemctl disable {{name}}.socket
	systemctl disable {{name}}
}

post_remove() {
	systemctl daemon-reload
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}
