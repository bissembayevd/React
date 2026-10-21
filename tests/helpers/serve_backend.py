"""Test-only server entry point; never imported by the production application."""
import sys

import uvicorn

from app.main import app


if __name__ == '__main__':
    server = uvicorn.Server(uvicorn.Config(app, host='127.0.0.1', port=int(sys.argv[1]), log_level='warning'))

    @app.post('/_test/shutdown', include_in_schema=False)
    async def shutdown():
        server.should_exit = True
        return {'status': 'stopping'}

    server.run()
