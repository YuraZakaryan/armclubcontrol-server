import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGU0YTdkMGEwYzY0MWRkY2U3YjliMWEiLCJlbWFpbCI6IjNhcWFyeWFuTW9kZXJAbWFpbC5ydXMiLCJ1c2VybmFtZSI6IjNhcWF5YW5Nb2Rlc3IiLCJyb2xlIjoiTU9ERVJBVE9SIiwiaWF0IjoxNjkyNzA2NzY4LCJleHAiOjE2OTI3OTMxNjh9.EDOy3dj8rvVUEuLbP4ojx5Pxr6-2uyw4WblE1uiz_yE',
    description: 'refresh',
  })
  readonly refresh: string;
}
