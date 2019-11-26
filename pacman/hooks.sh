
pre_install() {
	useradd -U -l -M -r -s /usr/bin/nologin -d /var/lib/{{name}} -c "{{description}}" -G systemd-journal {{name}}
}

post_install() {
	systemctl daemon-reload
	systemctl enable {{name}}
	systemctl enable {{name}}.socket
	systemctl start {{name}}.socket
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}

pre_upgrade() {
	systemctl stop {{name}}.socket
	systemctl stop {{name}}
}

post_upgrade() {
	usermode {{name}} -a -G systemd-journal
	systemctl daemon-reload
	systemctl start {{name}}.socket
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx
}

pre_remove() {
	systemctl stop {{name}}.socket
	systemctl disable {{name}}.socket
	systemctl stop {{name}}
	systemctl disable {{name}}
}

post_remove() {
	systemctl daemon-reload
	systemctl is-enabled nginx 2>&1 >/dev/null && systemctl -q try-reload-or-restart nginx

	userdel {{name}}
	groupdel {{name}}
}
