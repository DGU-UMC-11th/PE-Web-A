interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  result: T;
}

export async function readApiResult<T>(request: Promise<Response>): Promise<T> {
  const response = await request;
  const body: ApiResponse<T> = await response.json();
  if (!body.isSuccess) throw new Error(body.message);
  return body.result;
}

export async function checkMutation(request: Promise<Response>): Promise<void> {
  const response = await request;
  const body = await response.text();
  if (!body.trim()) return;

  const result: ApiResponse<unknown> = JSON.parse(body);
  if (!result.isSuccess) throw new Error(result.message);
}
