TypeError: AdminAccessor.get_recommendations() got an unexpected keyword argument 'fish_id'
Error handling request
Traceback (most recent call last):
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_protocol.py", line 452, in _handle_request
    resp = await request_handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_app.py", line 543, in _handle
    resp = await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_middlewares.py", line 114, in impl
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\backend\app\web\mw.py", line 85, in auth_middleware
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp_apispec\middlewares.py", line 48, in validation_middleware
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_urldispatcher.py", line 965, in _iter
    ret = await method()
          ^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\backend\app\admin\views.py", line 780, in post
    result = await self.request.app.store.admin.get_recommendations(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: AdminAccessor.get_recommendations() got an unexpected keyword argument 'fish_id'
Error handling request
Traceback (most recent call last):
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_protocol.py", line 452, in _handle_request
    resp = await request_handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_app.py", line 543, in _handle
    resp = await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_middlewares.py", line 114, in impl
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\backend\app\web\mw.py", line 85, in auth_middleware
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp_apispec\middlewares.py", line 48, in validation_middleware
    return await handler(request)
           ^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\.venv\Lib\site-packages\aiohttp\web_urldispatcher.py", line 965, in _iter
    ret = await method()
          ^^^^^^^^^^^^^^
  File "C:\Users\admin\Desktop\backend_angel_guide\backend\app\admin\views.py", line 780, in post
    result = await self.request.app.store.admin.get_recommendations(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: AdminAccessor.get_recommendations() got an unexpected keyword argument 'fish_id'
